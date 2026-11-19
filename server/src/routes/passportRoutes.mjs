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

// Requirements: SwR-ACCESS-088 (Passport dataset writes only by the responsible or authorised operator),
// delivered in part by decision D6, SwR-DATASET-200 (Passport rows written only in the data provider's
// deployment), delivered in part by decision D6, SwR-DATASET-195 (Direct re-use recorded as a purchaser
// change, never as a lineage step) and SwR-DATASET-197 (Forward link added on the original data
// provider's request), with decision D23 (The exposure after the commit). Section 9.3 of
// docs/architecture/implementation_plan.md.
// The operator endpoints of a passport (EL-BACKEND, the HTTP API): EP-PASSPORT-CREATE, EP-ASPECT-PUT,
// EP-ISSUE-NEW-PASSPORT, EP-TWIN, EP-FORWARD-LINK, EP-ACCESS-RECORD, EP-ACCESS-RECORD-END, EP-PURCHASER,
// EP-SUCCESSOR-AUTHORISATION and EP-PASSPORT-READ.
import express from "express";

import { authenticate } from "../access/authenticate.mjs";
import { requireCapability } from "../access/requireCapability.mjs";
import { Refusal } from "../dataset/refusals.mjs";
import { contextOf, identityParameter, runRead, runWrite, sendData, uuidParameter, validatedBody } from "./runWrite.mjs";

// Returns the router of the passport endpoints, mounted at /api/passports.
export function createPassportRoutes({ config, clock }) {
  const router = express.Router();
  const authenticated = authenticate({ config, clock });
  const refresh = (req, passportId) => contextOf(req).exposure.refreshPassportExposure({ pool: contextOf(req).pool, passportId });
  const lifecycle = (req) => contextOf(req).lifecycle;
  const accessRecords = (req) => contextOf(req).accessRecords;

  router.post("/", authenticated, requireCapability("passport.create"), async (req, res) => {
    const data = validatedBody(req, "createPassport");
    data.batteryModelId = data.batteryModelId.toLowerCase();
    const result = await runWrite(req, (client) => lifecycle(req).createFirstPassport({ client, subject: req.subject, data }));
    sendData(res, 201, { passport: result.passport, exposure: await refresh(req, result.passport.id) });
  });

  router.post("/new-passport", authenticated, requireCapability("passport.issue"), async (req, res) => {
    const data = validatedBody(req, "issueNewPassport");
    data.batteryModelId = data.batteryModelId.toLowerCase();
    const result = await runWrite(req, (client) => lifecycle(req).issueNewPassport({ client, subject: req.subject, data }));
    sendData(res, 201, { passport: result.passport, exposure: await refresh(req, result.passport.id), notifications: result.notifications });
  });

  router.get("/:passportId", authenticated, requireCapability("passport.write"), async (req, res) => {
    const passportId = uuidParameter(req, "passportId");
    const passport = await runRead(req, (client) => contextOf(req).recordReader.readPassportRecord({ client, passportId }));
    if (passport === null) throw new Refusal("ERR-LC-PASSPORT-NOT-FOUND");
    sendData(res, 200, { passport });
  });

  router.put("/:passportId/aspects/:aspectKey", authenticated, requireCapability("passport.write"), async (req, res) => {
    const passportId = uuidParameter(req, "passportId");
    const payload = req.body;
    const result = await runWrite(req, (client) => lifecycle(req).putAspectPayload({ client, subject: req.subject, passportId, aspectKey: req.params.aspectKey, payload }));
    sendData(res, 200, { passport: result.passport, exposure: await refresh(req, passportId) });
  });

  router.post("/:passportId/twin", authenticated, requireCapability("passport.write"), async (req, res) => {
    const passportId = uuidParameter(req, "passportId");
    const passport = await runRead(req, (client) => contextOf(req).recordReader.readPassportRecord({ client, passportId }));
    if (passport === null) throw new Refusal("ERR-LC-PASSPORT-NOT-FOUND");
    sendData(res, 200, { exposure: await refresh(req, passportId) });
  });

  router.post("/:passportId/forward-links", authenticated, requireCapability("passport.write"), async (req, res) => {
    const passportId = uuidParameter(req, "passportId");
    const data = validatedBody(req, "forwardLink");
    const result = await runWrite(req, (client) => lifecycle(req).addForwardLink({ client, subject: req.subject, passportId, messageId: data.messageId }));
    sendData(res, 201, { link: result.link, exposure: await refresh(req, passportId) });
  });

  router.post("/:passportId/access-records", authenticated, requireCapability("passport.write"), async (req, res) => {
    const passportId = uuidParameter(req, "passportId");
    const data = validatedBody(req, "accessRecord");
    const result = await runWrite(req, (client) => accessRecords(req).addAccessRecord({ client, subject: req.subject, passportId, data }));
    sendData(res, 201, { record: result.record, exposure: await refresh(req, passportId) });
  });

  router.delete("/:passportId/access-records/:recordId", authenticated, requireCapability("passport.write"), async (req, res) => {
    const passportId = uuidParameter(req, "passportId");
    const recordId = identityParameter(req, "recordId");
    const result = await runWrite(req, (client) => accessRecords(req).endAccessRecord({ client, subject: req.subject, passportId, recordId }));
    sendData(res, 200, { record: result.record, exposure: await refresh(req, passportId) });
  });

  router.post("/:passportId/purchaser", authenticated, requireCapability("passport.write"), async (req, res) => {
    const passportId = uuidParameter(req, "passportId");
    const data = validatedBody(req, "purchaserChange");
    const result = await runWrite(req, (client) => accessRecords(req).changePurchaser({ client, subject: req.subject, passportId, data }));
    sendData(res, 200, { closed: result.closed, opened: result.opened, exposure: await refresh(req, passportId) });
  });

  router.post("/:passportId/successor-authorisation", authenticated, requireCapability("passport.write"), async (req, res) => {
    const passportId = uuidParameter(req, "passportId");
    const data = validatedBody(req, "successorAuthorisation");
    const result = await runWrite(req, (client) => lifecycle(req).recordSuccessorAuthorisation({ client, subject: req.subject, passportId, data }));
    sendData(res, 200, { passport: result.passport });
  });

  return router;
}
