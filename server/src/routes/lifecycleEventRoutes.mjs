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

// Requirements: SwR-CXCLIENT-178 (PassportEnded sent to the data provider, nameplate manufacturer and
// successor), SwR-CXCLIENT-180 (BatteryRepaired sent to the data provider of the repaired battery's
// passport) and SwR-CXCLIENT-181 (BatteryBecameWaste sent to the data provider and the named successor),
// with decision D12 (No notification to the own company), decision D23 (The exposure after the commit)
// and decision D48 (The repair certificate before the notice) [waits for the owner]. System requirements
// SyR-LIFE-145 (Repair notified to the data provider of the passport) and SyR-LIFE-147 (Waste status
// notified to the data provider and the named successor). Sections 9.3 and 10.3 of
// docs/architecture/implementation_plan.md.
// The operator endpoints EP-REPORT-REPAIR, EP-REPORT-WASTE and EP-REPORT-RECYCLING (EL-BACKEND, the HTTP
// API).
import express from "express";

import { authenticate } from "../access/authenticate.mjs";
import { requireCapability } from "../access/requireCapability.mjs";
import { Refusal } from "../dataset/refusals.mjs";
import { afterCommit, contextOf, runWrite, sendData, validatedBody } from "./runWrite.mjs";

// Returns the router of the three report endpoints, mounted at /api/lifecycle-events.
export function createLifecycleEventRoutes({ config, clock }) {
  const router = express.Router();
  const guard = [authenticate({ config, clock }), requireCapability("lifecycle.report")];

  const report = (operation, data, req) => runWrite(req, (client) => contextOf(req).lifecycle.reportEvent({ client, subject: req.subject, operation, data }));

  router.post("/repair", ...guard, async (req, res) => {
    const data = validatedBody(req, "reportRepair");
    // Decision D48 [waits for the owner]: the twin registry of the own deployment holds the shell of
    // the repair certificate before the repairer reports the repair.
    if ((await contextOf(req).twinRegistry.read(data.repairCertificateCatenaXId)) === null) throw new Refusal("ERR-LC-CERTIFICATE-NOT-REGISTERED");
    const result = await report("BatteryRepaired", data, req);
    sendData(res, 202, { notifications: result.notifications });
  });

  router.post("/waste", ...guard, async (req, res) => {
    const context = contextOf(req);
    const result = await report("BatteryBecameWaste", validatedBody(req, "reportWaste"), req);
    if (result.appliedLocally) await context.exposure.refreshPassportExposure({ pool: context.pool, passportId: result.passportId });
    sendData(res, 202, { notifications: result.notifications });
  });

  router.post("/recycling", ...guard, async (req, res) => {
    const context = contextOf(req);
    const result = await report("PassportEnded", validatedBody(req, "reportRecycling"), req);
    if (result.appliedLocally) {
      await afterCommit(req, { passportId: result.passportId }, () => context.offerPublisher.withdrawDatasetOffers({ passportId: result.passportId }));
      await context.exposure.refreshPassportExposure({ pool: context.pool, passportId: result.passportId });
    }
    sendData(res, 202, { notifications: result.notifications });
  });

  return router;
}
