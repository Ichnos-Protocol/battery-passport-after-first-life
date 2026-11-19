/********************************************************************************
 * Copyright (c) 2026 Ichnos Protocol Pte. Ltd.
 * Copyright (c) 2026 Contributors to the Eclipse Foundation
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Apache License, Version 2.0 which is available at
 * https://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ********************************************************************************/

// Requirements: SwR-BACKEND-147 (Notification endpoints offered with HTTP POST only), SwR-BACKEND-148
// (Notification answered 200 when accepted, 4xx or 5xx otherwise) and SwR-BACKEND-207 (Four lifecycle
// notification operations received as POST endpoints). Sections 9.2.1 and 9.3 of
// docs/architecture/implementation_plan.md.
// The application factory of the reference server (EL-BACKEND, the HTTP API): the Express application
// with the routes of section 9.3 and the outbox worker of section 9.2.5. The factory creates no client
// and opens no port; it receives the pool, the clock and the four implementations of the ports.
import { randomUUID } from "node:crypto";

import express from "express";

import { createAccessRecordService } from "./access/accessRecordService.mjs";
import * as accessRecordRepository from "./access/accessRecordRepository.mjs";
import { createAuditLog } from "./audit/auditLog.mjs";
import * as auditRepository from "./audit/auditRepository.mjs";
import { createOutboxWorker } from "./background/outboxWorker.mjs";
import { createBatteryInformationPuller } from "./connector/batteryInformationPuller.mjs";
import { createExposure } from "./connector/exposure.mjs";
import { createIssuerContractService } from "./connector/issuerContractService.mjs";
import * as issuerContractRepository from "./connector/issuerContractRepository.mjs";
import * as notificationPlanner from "./connector/notificationPlan.mjs";
import * as notificationRepository from "./connector/notificationRepository.mjs";
import { createNotificationSender } from "./connector/notificationSender.mjs";
import { createOfferPublisher } from "./connector/offerPublisher.mjs";
import * as companyRepository from "./dataset/companyRepository.mjs";
import * as catalogue from "./dataset/lifecycleCatalogue.mjs";
import * as recordReader from "./dataset/lifecycleRecordReader.mjs";
import { createLifecycleService } from "./dataset/lifecycleService.mjs";
import * as passportRepository from "./dataset/passportRepository.mjs";
import { createBatteryModelRoutes } from "./routes/batteryModelRoutes.mjs";
import { Refusal } from "./dataset/refusals.mjs";
import { createErrorHandler, isReceivingRequest } from "./routes/errorHandler.mjs";
import { createHealthRoutes } from "./routes/healthRoutes.mjs";
import { createIssuerContractRoutes } from "./routes/issuerContractRoutes.mjs";
import { createLifecycleEventRoutes } from "./routes/lifecycleEventRoutes.mjs";
import { createLifecycleNotificationRoutes } from "./routes/lifecycleNotificationRoutes.mjs";
import { createNotificationRecordRoutes } from "./routes/notificationRecordRoutes.mjs";
import { createPassportRoutes } from "./routes/passportRoutes.mjs";
import { createSubmodelRoutes } from "./routes/submodelRoutes.mjs";
import * as accessMapRepository from "./submodels/accessMapRepository.mjs";
import { createAccessMapService } from "./submodels/accessMapService.mjs";
import { createSubmodelService } from "./submodels/submodelService.mjs";
import { createSchemaValidator } from "./validation/schemaValidator.mjs";

const BODY_LIMIT = "1mb";

// True when a request carries a body: a content length above 0 or a chunked transfer.
function hasBody(req) {
  const length = req.headers["content-length"];
  return (length !== undefined && length !== "0") || req.headers["transfer-encoding"] !== undefined;
}

// Returns { app, worker }.
export function createApp({ config, pool, clock, transport, offerStore, twinRegistry, receiverResolver, logger }) {
  const validator = createSchemaValidator();
  const accessMaps = createAccessMapService({ repository: accessMapRepository, passportRepository, companyRepository, validator, clock });
  const accessRecords = createAccessRecordService({ repository: accessRecordRepository, passportRepository, accessMaps, clock, accessRegime: config.accessRegime });
  const lifecycle = createLifecycleService({
    repository: passportRepository,
    catalogue,
    notificationPlanner,
    notificationRepository,
    accessRecords: accessRecordRepository,
    clock,
    newUuid: randomUUID,
    ownBpnl: config.ownBpnl,
    passportEndedDelaySeconds: config.passportEndedDelaySeconds,
    passportServiceProviderBpnl: config.passportServiceProviderBpnl,
    validator,
    accessMaps,
    companyRepository,
    recordReader,
    twinRegistry,
  });
  const submodels = createSubmodelService({ passportRepository, companyRepository, recordReader, accessRecords });
  const issuerContracts = createIssuerContractService({ repository: issuerContractRepository, passportRepository, validator, clock, ownBpnl: config.ownBpnl });
  const offerPublisher = createOfferPublisher({ offerStore, config, clock, passportRepository, accessRecordRepository, accessMaps });
  const exposure = createExposure({ config, clock, twinRegistry, offerPublisher, passportRepository, accessMapRepository, logger });
  const audit = createAuditLog({ pool, repository: auditRepository, clock, logger, ownBpnl: config.ownBpnl, retrySeconds: config.notificationRetrySeconds });
  const sender = createNotificationSender({
    pool,
    repository: notificationRepository,
    transport,
    receiverResolver,
    clock,
    maxAttempts: config.notificationMaxAttempts,
    retrySeconds: config.notificationRetrySeconds,
    ownBpnl: config.ownBpnl,
    logger,
  });
  const puller = createBatteryInformationPuller({ pool, repository: issuerContractRepository, transport, receiverResolver, validator, clock, ownBpnl: config.ownBpnl });
  const worker = createOutboxWorker({ sender, puller, audit, intervalMilliseconds: config.outboxIntervalMilliseconds, logger });

  const app = express();
  app.disable("x-powered-by");
  app.locals.context = Object.freeze({
    config,
    pool,
    clock,
    logger,
    validator,
    audit,
    lifecycle,
    accessMaps,
    accessRecords,
    submodels,
    issuerContracts,
    offerPublisher,
    exposure,
    sender,
    twinRegistry,
  });
  app.use((req, res, next) => {
    req.traceId = randomUUID();
    next();
  });
  app.use(express.json({ limit: BODY_LIMIT, type: "application/json" }));
  // A body of another content type is refused (section 9.3, the body parser).
  app.use((req, res, next) => {
    if (req.body === undefined && hasBody(req) && !req.is("application/json")) {
      const error = new Error("The body has a content type other than application/json.");
      error.type = "content.invalid";
      next(error);
      return;
    }
    next();
  });
  app.use(createHealthRoutes({ pool }));
  app.use("/api/lifecycle-notifications", createLifecycleNotificationRoutes({ config, clock }));
  app.use("/api/lifecycle-events", createLifecycleEventRoutes({ config, clock }));
  app.use("/api/notifications", createNotificationRecordRoutes({ config, clock }));
  app.use("/api/battery-models", createBatteryModelRoutes({ config, clock }));
  app.use("/api/passports", createPassportRoutes({ config, clock }));
  app.use("/api/issuer-contracts", createIssuerContractRoutes({ config, clock }));
  app.use("/api", createSubmodelRoutes({ config, clock }));
  // An unknown path answers one of the two refusals of section 9.5, without an authentication, because
  // the answer names no data (finding R45-012).
  app.use((req, res, next) => {
    next(new Refusal(isReceivingRequest(req) ? "ERR-RX-OPERATION-UNKNOWN" : "ERR-LC-PATH-UNKNOWN"));
  });
  app.use(createErrorHandler({ logger }));
  return { app, worker };
}
