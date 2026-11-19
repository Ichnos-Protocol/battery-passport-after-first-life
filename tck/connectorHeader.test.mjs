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

// Decision D41 (Authentication without an identity provider) and section 9.2.9 of
// docs/architecture/implementation_plan.md (the header test). Requirement: PrR-CXD-029 (Conformance tests
// run against the in-process binding and the connector binding).
// The test shows across the connectors of tck/docker-compose.yml that a consumer cannot choose the
// Business Partner Number that the server receives: the connector of the second-life operator opens a
// transfer of the notification asset of the data provider, and the operator posts through the provider
// data plane a BatteryRepaired message for an unknown passport with the header Edc-Bpn of another
// Business Partner Number. Only section 15 item 7 runs the file, on a started deployment.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";

import { buildMessageHeader } from "../server/src/connector/messageHeader.mjs";
import { NOTIFICATION_ASSET_ID } from "../server/src/connector/policyBuilder.mjs";
import { startBinding } from "./lib/binding.mjs";

test("D41 (Authentication without an identity provider): a header Edc-Bpn that the consumer sets itself does not reach the server with the consumer's value", async () => {
  const binding = await startBinding();
  try {
    const { provider, operator } = binding;
    const header = buildMessageHeader({ operation: "BatteryRepaired", senderBpnl: operator.bpnl, receiverBpnl: provider.bpnl, clock: { now: () => new Date() }, newUuid: randomUUID });
    const message = { header, content: { passportIdentifier: `TCK-HEADER-${randomUUID()}`, repairDate: "2026-03-20T09:00:00.000Z", repairCertificateCatenaXId: `urn:uuid:${randomUUID()}` } };
    const reference = await operator.openTransfer(provider, NOTIFICATION_ASSET_ID);
    const answer = await operator.callDataPlane(reference, "POST", "/BatteryRepaired", message, { "Edc-Bpn": "BPNL00000000TCK6" });
    // The provider data plane replaces the header with the consumer's Business Partner Number, so the
    // sender check passes and the receiving step refuses the unknown passport.
    assert.equal(answer.status, 404, JSON.stringify(answer.body));
    assert.equal(answer.body.error.code, "ERR-RX-PASSPORT-UNKNOWN");
  } finally {
    await binding.stop();
  }
});
