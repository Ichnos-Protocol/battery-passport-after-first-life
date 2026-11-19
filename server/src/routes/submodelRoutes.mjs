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

// Requirements: SwR-SUBMODELS-052 (Submodel endpoints change no stored data), SwR-DATASET-193 (New
// passport served under its own DPP Metadata identifier), SwR-DATASET-198 (Successors record served as
// a submodel of its own) and SwR-DATASET-126 (Lifecycle data delivered beside the seven aspects in the
// decided carrier), delivered in part by decision D46, with decision D3 (The access map and the whole
// aspect) [waits for the owner] and decision Q-409 (whether served aspect payloads skip the response
// envelope). Section 9.3 of docs/architecture/implementation_plan.md.
// The submodel endpoints EP-SUBMODEL and EP-ACCESS-MAP (EL-BACKEND, the HTTP API). Each answers the bare
// payload and writes nothing.
import express from "express";

import { authenticate } from "../access/authenticate.mjs";
import { requireCapability } from "../access/requireCapability.mjs";
import { Refusal } from "../dataset/refusals.mjs";
import { contextOf, runRead, uuidParameter } from "./runWrite.mjs";

// Returns the router of the two submodel endpoints, mounted at /api. Each endpoint also answers the same
// payload on the path with the further suffix /$value (section 9.3).
export function createSubmodelRoutes({ config, clock }) {
  const router = express.Router();
  const guard = [authenticate({ config, clock }), requireCapability("submodel.read")];

  const passportSubmodel = async (req, res) => {
    const passportId = uuidParameter(req, "passportId");
    const payload = await runRead(req, (client) => contextOf(req).submodels.readSubmodel({ client, subject: req.subject, passportId, aspectKey: req.params.aspectKey }));
    res.status(200).json(payload);
  };
  router.get("/passports/:passportId/submodels/:aspectKey/submodel", ...guard, passportSubmodel);
  router.get("/passports/:passportId/submodels/:aspectKey/submodel/\\$value", ...guard, passportSubmodel);

  const accessMap = async (req, res) => {
    const context = contextOf(req);
    const modelId = uuidParameter(req, "modelId");
    const today = context.clock.now().toISOString().slice(0, 10);
    const payload = await runRead(req, async (client) => {
      if ((await context.lifecycle.readBatteryModel({ client, modelId })) === null) throw new Refusal("ERR-LC-MODEL-NOT-FOUND");
      return context.accessMaps.readAccessMap({ client, modelId, today });
    });
    if (payload === null) throw new Refusal("ERR-LC-SUBMODEL-NOT-FOUND");
    res.status(200).json(payload);
  };
  router.get("/battery-models/:modelId/submodels/access-map/submodel", ...guard, accessMap);
  router.get("/battery-models/:modelId/submodels/access-map/submodel/\\$value", ...guard, accessMap);

  return router;
}
