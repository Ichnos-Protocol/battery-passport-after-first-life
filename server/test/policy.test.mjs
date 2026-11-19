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

// Tests the capabilities, the policy and the capability middleware of server/src/access.
//
// Requirements of the registry that this file verifies:
//   SwR-ACCESS-088 (Passport dataset writes only by the responsible or authorised operator)
//   SwR-DATASET-119 (Changes applied only for the responsible or an authorised operator)
// Section 9.2.3 of the implementation specification.
import assert from "node:assert/strict";
import { test } from "node:test";

import { CAPABILITIES } from "../src/access/capabilities.mjs";
import { capabilitiesOf } from "../src/access/policy.mjs";
import { requireCapability } from "../src/access/requireCapability.mjs";
import { Refusal } from "../src/dataset/refusals.mjs";

function run(middleware, subject) {
  let passed;
  middleware({ subject }, {}, (error) => {
    passed = error;
  });
  return passed;
}

test("SwR-ACCESS-088 (Passport dataset writes only by the responsible or authorised operator): the capabilities of a subject", async (t) => {
  await t.test("CAPABILITIES holds the nine capabilities of section 9.2.3", () => {
    assert.deepStrictEqual(
      [...CAPABILITIES],
      ["passport.create", "passport.issue", "passport.write", "lifecycle.report", "access-map.write", "notification.read", "battery-information.share", "notification.receive", "submodel.read"],
    );
  });
  await t.test("an operator subject receives the first seven capabilities and submodel.read", () => {
    assert.deepStrictEqual(capabilitiesOf({ kind: "operator", bpnl: "BPNL00000000TCK1" }), [
      "passport.create",
      "passport.issue",
      "passport.write",
      "lifecycle.report",
      "access-map.write",
      "notification.read",
      "battery-information.share",
      "submodel.read",
    ]);
  });
  await t.test("a partner subject receives notification.receive and submodel.read", () => {
    assert.deepStrictEqual(capabilitiesOf({ kind: "partner", bpnl: "BPNL00000000TCK2" }), ["notification.receive", "submodel.read"]);
  });
  await t.test("an unknown subject kind, a missing subject and a subject that is no object receive no capability", () => {
    assert.deepStrictEqual(capabilitiesOf({ kind: "administrator", bpnl: "BPNL00000000TCK1" }), []);
    assert.deepStrictEqual(capabilitiesOf(undefined), []);
    assert.deepStrictEqual(capabilitiesOf("operator"), []);
  });
});

test("SwR-DATASET-119 (Changes applied only for the responsible or an authorised operator): requireCapability", async (t) => {
  await t.test("requireCapability throws for a string outside CAPABILITIES, for a list and for a role", () => {
    for (const value of ["passport.delete", ["passport.write"], "manufacturer", undefined]) assert.throws(() => requireCapability(value), TypeError);
  });
  await t.test("the middleware passes a subject with the capability", () => {
    assert.equal(run(requireCapability("passport.write"), { kind: "operator", bpnl: "BPNL00000000TCK1" }), undefined);
  });
  await t.test("the middleware passes the refusal ERR-AC-CAPABILITY-MISSING with the status 403 for a subject without the capability", () => {
    const refused = run(requireCapability("passport.write"), { kind: "partner", bpnl: "BPNL00000000TCK2" });
    assert.ok(refused instanceof Refusal);
    assert.equal(refused.id, "ERR-AC-CAPABILITY-MISSING");
    assert.equal(refused.status, 403);
    assert.ok(run(requireCapability("notification.receive"), { kind: "operator", bpnl: "BPNL00000000TCK1" }) instanceof Refusal);
  });
});
