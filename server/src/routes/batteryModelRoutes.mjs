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

// Requirements: SwR-DATASET-065 (Every dataset field marked with exactly one Art. 77(2) access group)
// and SwR-SUBMODELS-036 (Access marking assigns every served passport field one group), with decision
// D23 (The exposure after the commit) and decision D35 (The reference to the original battery model).
// Section 9.3 of docs/architecture/implementation_plan.md.
// The operator endpoints of a battery model (EL-BACKEND, the HTTP API): EP-MODEL-CREATE, EP-MODEL-TWIN
// and EP-ACCESS-MAP-PUT.
import express from "express";

import { authenticate } from "../access/authenticate.mjs";
import { requireCapability } from "../access/requireCapability.mjs";
import { Refusal } from "../dataset/refusals.mjs";
import { combinedExposure, contextOf, runRead, runWrite, sendData, uuidParameter, validatedBody } from "./runWrite.mjs";

// Returns the router of the battery model endpoints, mounted at /api/battery-models.
export function createBatteryModelRoutes({ config, clock }) {
  const router = express.Router();
  const authenticated = authenticate({ config, clock });
  const refreshModel = (req, modelId) => contextOf(req).exposure.refreshModelExposure({ pool: contextOf(req).pool, modelId });

  router.post("/", authenticated, requireCapability("passport.create"), async (req, res) => {
    const data = validatedBody(req, "batteryModel");
    const result = await runWrite(req, (client) => contextOf(req).lifecycle.createBatteryModel({ client, subject: req.subject, data }));
    sendData(res, 201, { model: result.model, exposure: await refreshModel(req, result.model.id) });
  });

  router.post("/:modelId/twin", authenticated, requireCapability("passport.create"), async (req, res) => {
    const modelId = uuidParameter(req, "modelId");
    const model = await runRead(req, (client) => contextOf(req).passportRepository.findBatteryModel(client, modelId));
    if (model === null) throw new Refusal("ERR-LC-MODEL-NOT-FOUND");
    sendData(res, 200, { exposure: await refreshModel(req, modelId) });
  });

  router.put("/:modelId/access-map", authenticated, requireCapability("access-map.write"), async (req, res) => {
    const context = contextOf(req);
    const modelId = uuidParameter(req, "modelId");
    const map = req.body;
    const result = await runWrite(req, (client) => context.accessMaps.putAccessMap({ client, modelId, map }));
    const exposures = [await refreshModel(req, modelId)];
    for (const passportId of result.passportIds) exposures.push(await context.exposure.refreshPassportExposure({ pool: context.pool, passportId }));
    sendData(res, 201, { id: result.id, accessMap: result.accessMap, exposure: combinedExposure(exposures) });
  });

  return router;
}
