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

// Tests the subset of JSONPath of server/src/submodels/jsonPathSubset.mjs.
//
// Requirements of the registry that this file verifies:
//   SwR-DATASET-065 (Every dataset field marked with exactly one Art. 77(2) access group)
//   SwR-SUBMODELS-036 (Access marking assigns every served passport field one group)
// Decision D27 (A subset of JSONPath).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { allLeaves, compilePath, matchLeaves } from "../src/submodels/jsonPathSubset.mjs";

const fixture = (name) => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8"));
const nameplate = fixture("nameplate.json");
const technicalData = fixture("technicalData.json");
const productCondition = fixture("productCondition.json");

const match = (path, payload) => matchLeaves(compilePath(path), payload).sort();

test("decision D27 (A subset of JSONPath): each selector of the subset on the fixtures", async (t) => {
  await t.test("the root identifier $ selects every leaf of the payload", () => {
    assert.deepStrictEqual(match("$", productCondition), allLeaves(productCondition).sort());
  });
  await t.test("the name selector in dot notation selects one leaf", () => {
    assert.deepStrictEqual(match("$.LifeCycleStage", nameplate), ["/LifeCycleStage"]);
  });
  await t.test("the name selector selects every leaf below an object", () => {
    assert.deepStrictEqual(match("$.NumberOfFullCycles", productCondition), ["/NumberOfFullCycles/LastUpdate", "/NumberOfFullCycles/NumberOfFullCyclesValue"]);
  });
  await t.test("a chain of name selectors selects a leaf at the third level", () => {
    assert.deepStrictEqual(match("$.TechnicalPropertyAreas.CapacityEnergyVoltage.RatedCapacity", technicalData), ["/TechnicalPropertyAreas/CapacityEnergyVoltage/RatedCapacity"]);
  });
  await t.test("the name selector in bracket notation, with single and with double quotes", () => {
    assert.deepStrictEqual(match("$['GeneralInformation']['BatteryCategory']", technicalData), ["/GeneralInformation/BatteryCategory"]);
    assert.deepStrictEqual(match('$["GeneralInformation"]["BatteryCategory"]', technicalData), ["/GeneralInformation/BatteryCategory"]);
    assert.deepStrictEqual(match("$['TemperatureRangeIdleState_LowerBoundary']", technicalData.TechnicalPropertyAreas.Temperature), ["/TemperatureRangeIdleState_LowerBoundary"]);
  });
  await t.test("the wildcard selector selects every item of a list", () => {
    assert.deepStrictEqual(match("$.Markings[*].MarkingName", nameplate), ["/Markings/0/MarkingName"]);
    assert.deepStrictEqual(match("$.ManufacturerName[*]", nameplate), ["/ManufacturerName/0/en"]);
  });
  await t.test("the wildcard selector selects every member of an object", () => {
    assert.deepStrictEqual(match("$.StateOfCharge[*]", productCondition), ["/StateOfCharge/LastUpdate", "/StateOfCharge/StateOfChargeValue"]);
  });
  await t.test("the index selector with a non-negative integer", () => {
    assert.deepStrictEqual(match("$.EUDeclarationOfConformity[0]", nameplate), ["/EUDeclarationOfConformity/0"]);
    assert.deepStrictEqual(match("$.EUDeclarationOfConformity[1]", nameplate), []);
  });
  await t.test("the filter selector of the form [?@.<name>=='<string>']", () => {
    assert.deepStrictEqual(match("$.Markings[?@.MarkingName=='CE'].MarkingFile.value", nameplate), ["/Markings/0/MarkingFile/value"]);
    assert.deepStrictEqual(match("$.Markings[?@.MarkingName=='UKCA']", nameplate), []);
  });
  await t.test("a path whose name is absent selects nothing", () => {
    assert.deepStrictEqual(match("$.NotAField", nameplate), []);
  });
  await t.test("allLeaves lists every value that is neither an object nor a list", () => {
    assert.deepStrictEqual(allLeaves({ a: 1, b: [true, { c: null }], d: {}, e: [] }).sort(), ["/a", "/b/0", "/b/1/c"]);
  });
});

test("decision D27: a path outside the subset is refused", async (t) => {
  for (const path of [
    "",
    "ManufacturerName",
    "$..ManufacturerName",
    "$.*",
    "$[-1]",
    "$[01]",
    "$[0:2]",
    "$[1,2]",
    "$[?@.MarkingName!='CE']",
    "$[?(@.MarkingName=='CE')]",
    "$[?@.MarkingName==\"CE\"]",
    "$['a\\'b']",
    "$.Markings[",
    "$.1Name",
    "@.ManufacturerName",
  ]) {
    await t.test(`compilePath refuses ${JSON.stringify(path)}`, () => {
      assert.equal(compilePath(path), null);
    });
  }
  await t.test("compilePath accepts each selector of the subset", () => {
    for (const path of ["$", "$.a", "$['a']", '$["a"]', "$[*]", "$[0]", "$[12]", "$[?@.name=='value']", "$.a[*].b[0][?@.c=='d']"]) assert.notEqual(compilePath(path), null, path);
  });
});
