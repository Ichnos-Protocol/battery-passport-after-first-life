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
// Business Partner Number that the server receives, with an assertion that the provider data plane cannot
// hide: the second-life operator posts through the data plane of the data provider an applied
// BatteryRepaired with the header Edc-Bpn of another Business Partner Number, and the received record of
// the data provider names the true sender. Only section 15 item 7 runs the file, on a started deployment.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";

import { buildMessageHeader } from "../server/src/connector/messageHeader.mjs";
import { NOTIFICATION_ASSET_ID } from "../server/src/connector/policyBuilder.mjs";
import { startBinding } from "./lib/binding.mjs";
import { DATES, givenOriginalPassport, passportOf, receivedOf } from "./lib/scenario.mjs";

test("D41 (Authentication without an identity provider): a header Edc-Bpn that the consumer sets itself does not reach the server with the consumer's value", async () => {
  const binding = await startBinding();
  try {
    const { provider, operator } = binding;
    const passport = await givenOriginalPassport(provider);
    const header = buildMessageHeader({ operation: "BatteryRepaired", senderBpnl: operator.bpnl, receiverBpnl: provider.bpnl, clock: { now: () => new Date() }, newUuid: randomUUID });
    const message = { header, content: { passportIdentifier: passport.passportIdentifier, repairDate: DATES.repair, repairCertificateCatenaXId: `urn:uuid:${randomUUID()}` } };
    const reference = await operator.openTransfer(provider, NOTIFICATION_ASSET_ID);
    const answer = await operator.callDataPlane(reference, "POST", "/BatteryRepaired", message, { "Edc-Bpn": "BPNL00000000TCK6" });
    assert.equal(answer.status, 200, JSON.stringify(answer.body));
    assert.deepStrictEqual(answer.body, { messageId: header.messageId, outcome: "applied" });
    // The fifth check of section 10.4 refuses a message whose sender differs from the header of the
    // partner, so the received record shows that the data plane replaced the header of the consumer.
    const record = (await receivedOf(provider)).find((item) => item.messageId === header.messageId);
    assert.ok(record, "the data provider holds the received record of the message");
    assert.equal(record.senderBpnl, operator.bpnl);
    assert.equal(record.senderBpnl, "BPNL00000000TCK2");
    assert.equal((await passportOf(provider, passport.id)).lifecycleStatus, "re-used");
  } finally {
    await binding.stop();
  }
});
