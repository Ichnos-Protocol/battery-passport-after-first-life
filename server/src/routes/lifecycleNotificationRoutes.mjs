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
// (Notification answered 200 when accepted, 4xx or 5xx otherwise), SwR-BACKEND-206 (Lifecycle
// notification failures answered with envelope and result object) and SwR-BACKEND-207 (Four lifecycle
// notification operations received as POST endpoints), with decision D7 (The receiver guard), decision
// D8 (Idempotency by the message identifier), decision D23 (The exposure after the commit) and decision
// D70 (The recycler of PassportEnded is the sender). System
// requirements SyR-CXD-092 (Notification APIs offered and called with HTTP POST only) and SyR-CXD-096
// (Notification endpoints answer 200, or 4xx or 5xx on failure). Sections 9.3 and 10.4 of
// docs/architecture/implementation_plan.md.
// The four receiving endpoints EP-RX-NEW-PASSPORT, EP-RX-REPAIRED, EP-RX-WASTE and EP-RX-ENDED
// (EL-BACKEND, the HTTP API).
import express from "express";

import { authenticate } from "../access/authenticate.mjs";
import { requireCapability } from "../access/requireCapability.mjs";
import { OPERATION_NAMES } from "../dataset/lifecycleCatalogue.mjs";
import { Refusal } from "../dataset/refusals.mjs";
import { normaliseMessage } from "../identifiers.mjs";
import { validatorMessages } from "../validation/schemaValidator.mjs";
import { afterCommit, contextOf, runWrite } from "./runWrite.mjs";

// The first three checks of section 10.4: the classification of the validator errors of the envelope
// definition of the operation. Returns null for a valid body.
export function classifyMessageErrors(errors) {
  if (errors.length === 0) return null;
  const rootErrors = errors.filter((error) => error.instancePath === "");
  if (rootErrors.length > 0) return new Refusal("ERR-RX-CONTENT-INVALID", { messages: validatorMessages(rootErrors) });
  const isContextConst = (error) => error.instancePath === "/header/context" && error.keyword === "const";
  const headerErrors = errors.filter((error) => (error.instancePath === "/header" || error.instancePath.startsWith("/header/")) && !isContextConst(error));
  if (headerErrors.length > 0) return new Refusal("ERR-RX-HEADER-INVALID", { messages: validatorMessages(headerErrors) });
  const contentErrors = errors.filter((error) => error.instancePath === "/content" || error.instancePath.startsWith("/content/"));
  if (contentErrors.length > 0) {
    const outside = contentErrors.every((error) => error.keyword === "additionalProperties");
    return new Refusal(outside ? "ERR-RX-CHANGE-OUTSIDE-STEP" : "ERR-RX-CONTENT-INVALID", {
      messages: outside ? contentErrors.map((error) => `/content property ${error.params.additionalProperty} lies outside the content of the operation`) : validatorMessages(contentErrors),
    });
  }
  return new Refusal("ERR-RX-CONTEXT-MISMATCH", { messages: validatorMessages(errors.filter(isContextConst)) });
}

// Returns the router of the four receiving endpoints, mounted at /api/lifecycle-notifications.
export function createLifecycleNotificationRoutes({ config, clock }) {
  const router = express.Router();
  const guard = [authenticate({ config, clock }), requireCapability("notification.receive")];
  for (const operation of OPERATION_NAMES) {
    router.post(`/${operation}`, ...guard, async (req, res) => {
      const context = contextOf(req);
      const validation = context.validator.validateMessage(operation, req.body);
      const invalid = classifyMessageErrors(validation.errors);
      if (invalid !== null) throw invalid;
      if (req.body.header.receiverBpn !== config.ownBpnl) throw new Refusal("ERR-RX-RECEIVER-MISMATCH");
      if (req.body.header.senderBpn !== req.subject.bpnl) throw new Refusal("ERR-RX-SENDER-MISMATCH");
      // Decision D70 (The recycler of PassportEnded is the sender).
      if (operation === "PassportEnded" && req.body.content.recyclerBpnl !== req.body.header.senderBpn) {
        throw new Refusal("ERR-RX-SENDER-MISMATCH", { messages: ["/content/recyclerBpnl differs from /header/senderBpn"] });
      }
      const message = normaliseMessage(req.body);
      const result = await runWrite(req, (client) => context.lifecycle.applyNotification({ client, subject: req.subject, operation, message }));
      if (result.outcome === "applied" && operation === "BatteryBecameWaste") {
        await context.exposure.refreshPassportExposure({ pool: context.pool, passportId: result.passportId });
      }
      if (result.outcome === "applied" && operation === "PassportEnded") {
        await afterCommit(req, { passportId: result.passportId }, () => context.offerPublisher.withdrawDatasetOffers({ passportId: result.passportId }), "offerStore");
        await context.exposure.refreshPassportExposure({ pool: context.pool, passportId: result.passportId });
      }
      res.status(200).json({ messageId: result.messageId, outcome: result.outcome });
    });
    // Every other method on the path of a receiving endpoint answers 405.
    router.all(`/${operation}`, () => {
      throw new Refusal("ERR-RX-METHOD-NOT-ALLOWED");
    });
  }
  return router;
}
