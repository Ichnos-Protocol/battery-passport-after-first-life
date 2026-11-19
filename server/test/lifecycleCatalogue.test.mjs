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

// Tests the lifecycle catalogue of server/src/dataset/lifecycleCatalogue.mjs.
//
// Requirements of the registry that this file verifies:
//   SwR-DATASET-087 (Operations admitted only from the statuses the admission table allows)
//   SwR-DATASET-091 (Operations admitted by comparing current and original purpose)
//   SyR-LIFE-013 (Preparation for re-use or repurposing admitted only for waste)
//   SyR-LIFE-014 (Repurposing admitted only for a battery that is not waste)
//   SyR-LIFE-015 (Repurposing admitted only for a purpose different from the original)
//   SyR-LIFE-016 (Remanufacturing admitted only for the original purpose)
//   SyR-LIFE-017 (Preparation for re-use admitted only for the original purpose)
// Lesson 6 of docs/lessons-from-a-first-implementation.md (the rules refuse every action on a waste
// battery). Decision D40 (The admission rule).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { LIFECYCLE_STATUS_VALUES, LINEAGE_OPERATIONS, OPERATIONS, isOperationAdmitted, normalisePurpose } from "../src/dataset/lifecycleCatalogue.mjs";

const STATUS_FILE = new URL("../../sources/IDTA/io.admin-shell.idta.batterypass.digital_nameplate/1.0.0/BatteryStatus_enum.ttl", import.meta.url);
const SCHEMA_FILE = new URL("../src/db/migrations/001_schema.sql", import.meta.url);

test("SwR-DATASET-087 (Operations admitted only from the statuses the admission table allows): the catalogue", async (t) => {
  await t.test("the four contexts of section 10.1", () => {
    assert.deepStrictEqual(
      Object.fromEntries(Object.values(OPERATIONS).map((operation) => [operation.name, operation.context])),
      {
        NewPassportIssued: "BatteryPass-BatteryPassLifecycleNotificationAPI-NewPassportIssued:1",
        BatteryRepaired: "BatteryPass-BatteryPassLifecycleNotificationAPI-BatteryRepaired:1",
        BatteryBecameWaste: "BatteryPass-BatteryPassLifecycleNotificationAPI-BatteryBecameWaste:1",
        PassportEnded: "BatteryPass-BatteryPassLifecycleNotificationAPI-PassportEnded:1",
      },
    );
  });
  await t.test("the five status values equal the values of the stored enumeration file", () => {
    const text = readFileSync(STATUS_FILE, "utf8");
    // The enumeration lists five value nodes, and each node carries its text in samm:value.
    const nodes = /samm-c:values\s*\(([^)]*)\)/.exec(text)[1].trim().split(/\s+/);
    const values = nodes.map((node) => new RegExp(`^${node} a samm:Value ;[\\s\\S]*?samm:value "([^"]+)"`, "m").exec(text)[1]);
    assert.deepStrictEqual([...values].sort(), [...LIFECYCLE_STATUS_VALUES].sort());
    assert.equal(values.length, 5);
  });
  await t.test("the five status values equal the CHECK constraint passports_lifecycle_status_check", () => {
    const text = readFileSync(SCHEMA_FILE, "utf8");
    const check = /passports_lifecycle_status_check CHECK \(lifecycle_status IN \(([^)]*)\)\)/.exec(text)[1];
    assert.deepStrictEqual(
      check.split(",").map((value) => value.trim().slice(1, -1)),
      [...LIFECYCLE_STATUS_VALUES],
    );
  });
  await t.test("the status of the new passport per operation is re-used, repurposed, repurposed and remanufactured", () => {
    assert.deepStrictEqual(
      Object.fromEntries(Object.entries(LINEAGE_OPERATIONS).map(([name, rule]) => [name, rule.newStatus])),
      { preparationForReUse: "re-used", preparationForRepurposing: "repurposed", repurposing: "repurposed", remanufacturing: "remanufactured" },
    );
  });
});

test("SwR-DATASET-091 (Operations admitted by comparing current and original purpose): the admission rule of D40 for each pair of status and purpose", async (t) => {
  const ORIGINAL = "Traction battery of an electric vehicle";
  const SAME = "  traction   BATTERY of an\telectric vehicle ";
  const DIFFERENT = "Stationary storage of a home";
  // The admitted cells of D40: waste with the same purpose admits preparationForReUse, waste with
  // another purpose admits preparationForRepurposing, another status with another purpose admits
  // repurposing, and another status with the same purpose admits remanufacturing.
  const admitted = (operation, status, samePurpose) => {
    const waste = status === "waste";
    return (
      (operation === "preparationForReUse" && waste && samePurpose) ||
      (operation === "preparationForRepurposing" && waste && !samePurpose) ||
      (operation === "repurposing" && !waste && !samePurpose) ||
      (operation === "remanufacturing" && !waste && samePurpose)
    );
  };
  for (const operation of Object.keys(LINEAGE_OPERATIONS)) {
    for (const status of LIFECYCLE_STATUS_VALUES) {
      for (const samePurpose of [true, false]) {
        const expected = admitted(operation, status, samePurpose);
        await t.test(`${operation} from ${status} with ${samePurpose ? "the same" : "another"} purpose is ${expected ? "admitted" : "refused"}`, () => {
          assert.equal(isOperationAdmitted({ operation, status, originalPurpose: ORIGINAL, purpose: samePurpose ? SAME : DIFFERENT }), expected);
        });
      }
    }
  }
  await t.test("the normalisation of section 9.2.2 removes white space at both ends, joins each run of white space and converts to lower case", () => {
    assert.equal(normalisePurpose(SAME), "traction battery of an electric vehicle");
    assert.equal(normalisePurpose(ORIGINAL), normalisePurpose(SAME));
  });
  await t.test("an unknown operation and an unknown status are refused", () => {
    assert.equal(isOperationAdmitted({ operation: "directReUse", status: "original", originalPurpose: ORIGINAL, purpose: ORIGINAL }), false);
    assert.equal(isOperationAdmitted({ operation: "remanufacturing", status: "used", originalPurpose: ORIGINAL, purpose: ORIGINAL }), false);
  });
});
