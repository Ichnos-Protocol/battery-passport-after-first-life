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

// Requirements: SwR-CXCLIENT-166 (Point 4 offer for the passport issuer gated by a recorded contract),
// SwR-CXCLIENT-167 (Issuer's negotiation for point 4 information run without a user step),
// SwR-CXCLIENT-168 (Point 4 transfer to the issuer stored without a user step) and SwR-CXCLIENT-177
// (Second-life battery's point 4 offer to the original data provider), with decision D38 (The sharing
// of individual battery information). System requirement SyR-PASS-215 (Individual battery information
// shared with the passport issuer under contract). Section 9.3 of
// docs/architecture/implementation_plan.md.
// The endpoints of the issuer contracts (EL-BACKEND, the HTTP API): EP-PROVIDER-CONTRACT,
// EP-ISSUER-CONTRACT, EP-CONTRACT-END, EP-CONTRACT-PULL, EP-RECEIVED-INFORMATION and
// EP-BATTERY-INFORMATION.
import express from "express";

import { authenticate } from "../access/authenticate.mjs";
import { requireCapability } from "../access/requireCapability.mjs";
import { Refusal } from "../dataset/refusals.mjs";
import { afterCommit, contextOf, runRead, runWrite, sendData, uuidParameter, validatedBody } from "./runWrite.mjs";

// The body of the schema issuerContract in the form that the endpoint names.
function contractBody(req, form) {
  const data = validatedBody(req, "issuerContract");
  const isProviderForm = Object.hasOwn(data, "issuerBpnl");
  if (isProviderForm !== (form === "provider")) {
    throw new Refusal("ERR-LC-BODY-INVALID", { messages: [`/ is not the ${form} form of the schema issuerContract`] });
  }
  return data;
}

// Returns the router of the contract endpoints, mounted at /api/issuer-contracts.
export function createIssuerContractRoutes({ config, clock }) {
  const router = express.Router();
  const authenticated = authenticate({ config, clock });
  const operator = [authenticated, requireCapability("battery-information.share")];
  const contracts = (req) => contextOf(req).issuerContracts;

  router.post("/provider", ...operator, async (req, res) => {
    const data = contractBody(req, "provider");
    const { contract } = await runWrite(req, (client) => contracts(req).recordProviderContract({ client, subject: req.subject, data }));
    await afterCommit(req, { contractId: contract.id }, () =>
      contextOf(req).offerPublisher.publishBatteryInformationOffer({ contractId: contract.id, issuerBpnl: contract.issuerBpnl, passportIdentifier: contract.passportIdentifier }),
    );
    sendData(res, 201, { contract });
  });

  router.post("/issuer", ...operator, async (req, res) => {
    const data = contractBody(req, "issuer");
    const { contract } = await runWrite(req, (client) => contracts(req).recordIssuerContract({ client, subject: req.subject, data }));
    sendData(res, 201, { contract });
  });

  router.delete("/:contractId", ...operator, async (req, res) => {
    const contractId = uuidParameter(req, "contractId");
    const { contract } = await runWrite(req, (client) => contracts(req).endContract({ client, subject: req.subject, contractId }));
    if (contract.side === "provider") await afterCommit(req, { contractId }, () => contextOf(req).offerPublisher.withdrawBatteryInformationOffer({ contractId }));
    sendData(res, 200, { contract });
  });

  router.post("/:contractId/pulls", ...operator, async (req, res) => {
    const contractId = uuidParameter(req, "contractId");
    const { contract } = await runWrite(req, (client) => contracts(req).requestPull({ client, contractId }));
    sendData(res, 202, { contract });
  });

  router.get("/:contractId/received", ...operator, async (req, res) => {
    const contractId = uuidParameter(req, "contractId");
    sendData(res, 200, await runRead(req, (client) => contracts(req).readReceivedInformation({ client, contractId })));
  });

  router.get("/:contractId/battery-information", authenticated, requireCapability("submodel.read"), async (req, res) => {
    const contractId = uuidParameter(req, "contractId");
    if (req.subject.kind !== "partner") throw new Refusal("ERR-AC-CAPABILITY-MISSING");
    res.status(200).json(await runRead(req, (client) => contracts(req).readBatteryInformation({ client, subject: req.subject, contractId })));
  });

  return router;
}
