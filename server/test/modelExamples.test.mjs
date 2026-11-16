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

// Tests the generated schemas and the example payloads of the three proposed aspect models
// in docs/api/aspects, and the one compiler of the draft-04 aspect schemas.
//
// Requirements of the registry that this file verifies:
//   PrR-CXD-026 (Three proposed models in the sldt-semantic-models layout)
//   PrR-CXD-027 (Proposed models validated with SAMM CLI 2.11.1), for the schemas that the tool generated
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import Ajv04 from "ajv-draft-04";
import addFormats from "ajv-formats";

import { readAnnexFiles } from "../../scripts/check-annexes.mjs";
import { createAspectSchemaCompiler, SAMM_SCHEMA_KEYWORDS } from "../src/validation/aspectSchemaCompiler.mjs";

const REPOSITORY_ROOT = new URL("../../", import.meta.url);
const ASPECTS_DIRECTORY = new URL("docs/api/aspects/", REPOSITORY_ROOT);
const MODELS_DIRECTORY = new URL("models/", REPOSITORY_ROOT);
const STORED_IDTA_DIRECTORY = new URL("sources/IDTA/", REPOSITORY_ROOT);
const PROPOSAL_FILE = new URL("docs/proposal/CX-0160-4_Battery_passport_after_the_first_passport.md", REPOSITORY_ROOT);
const SPECIFICATION_FILE = new URL("docs/architecture/implementation_plan.md", REPOSITORY_ROOT);

// The three proposed aspect models, each with its namespace folder of models/.
const MODELS = [
  { aspect: "BatteryPassportLifecycle", namespace: "io.catenax.battery.passport_lifecycle" },
  { aspect: "BatteryPassportSuccessors", namespace: "io.catenax.battery.passport_successors" },
  { aspect: "BatteryPassportAccessMap", namespace: "io.catenax.battery.passport_access_map" },
];

function readJson(url) {
  return JSON.parse(readFileSync(url, "utf8"));
}

function readGeneratedSchema(aspect) {
  return readJson(new URL(`${aspect}-schema.json`, ASPECTS_DIRECTORY));
}

function readExample(aspect) {
  return readJson(new URL(`${aspect}.json`, ASPECTS_DIRECTORY));
}

// Every compiler of this file is the result of createAspectSchemaCompiler(), except the one
// compiler of the test that shows why the two keywords of SAMM_SCHEMA_KEYWORDS are needed.
function compileGeneratedSchema(aspect) {
  return createAspectSchemaCompiler().compile(readGeneratedSchema(aspect));
}

// Lists every file below the directory whose name ends with the suffix.
function listFiles(directoryUrl, suffix) {
  const found = [];
  for (const entry of readdirSync(directoryUrl, { withFileTypes: true })) {
    if (entry.isDirectory()) found.push(...listFiles(new URL(`${entry.name}/`, directoryUrl), suffix));
    else if (entry.name.endsWith(suffix)) found.push(new URL(entry.name, directoryUrl));
  }
  return found;
}

// Returns the parsed value of the first fenced block of the language json after the heading.
function firstJsonBlockAfterHeading(markdown, heading) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const headingIndex = lines.indexOf(heading);
  assert.notEqual(headingIndex, -1, `the proposal holds no line "${heading}"`);
  const start = lines.indexOf("```json", headingIndex);
  assert.notEqual(start, -1, `the proposal holds no json block after the heading "${heading}"`);
  const end = lines.indexOf("```", start + 1);
  assert.notEqual(end, -1, `the json block after the heading "${heading}" has no end`);
  return JSON.parse(lines.slice(start + 1, end).join("\n"));
}

describe("PrR-CXD-026 (Three proposed models in the sldt-semantic-models layout): the generated schemas and the example payloads of docs/api/aspects", () => {
  it("PrR-CXD-026: the function createAspectSchemaCompiler returns a new compiler at each call, and SAMM_SCHEMA_KEYWORDS names the two keywords of the SAMM command line tool", () => {
    assert.deepEqual([...SAMM_SCHEMA_KEYWORDS], ["x-samm-aspect-model-urn", "components"]);
    assert.notEqual(createAspectSchemaCompiler(), createAspectSchemaCompiler());
  });

  for (const { aspect, namespace } of MODELS) {
    it(`PrR-CXD-026: the generated schema of ${aspect} declares the draft-04 dialect and the identifier of the model, and compiles`, () => {
      const schema = readGeneratedSchema(aspect);
      assert.equal(schema.$schema, "http://json-schema.org/draft-04/schema");
      assert.equal(schema["x-samm-aspect-model-urn"], `urn:samm:${namespace}:1.0.0#${aspect}`);
      assert.equal(typeof compileGeneratedSchema(aspect), "function");
    });

    it(`PrR-CXD-026: the example file of ${aspect} validates against the generated schema of ${aspect}`, () => {
      const validate = compileGeneratedSchema(aspect);
      assert.equal(validate(readExample(aspect)), true, JSON.stringify(validate.errors));
    });

    it(`PrR-CXD-026: the namespace folder of ${aspect} holds exactly the release notes, the model file and the metadata file, and no folder gen`, () => {
      const namespaceDirectory = new URL(`${namespace}/`, MODELS_DIRECTORY);
      assert.deepEqual(readdirSync(namespaceDirectory).sort(), ["1.0.0", "RELEASE_NOTES.md"]);
      assert.deepEqual(readdirSync(new URL("1.0.0/", namespaceDirectory)).sort(), [`${aspect}.ttl`, "metadata.json"]);
      assert.deepEqual(readJson(new URL("1.0.0/metadata.json", namespaceDirectory)), { status: "draft" });
      assert.equal(existsSync(new URL("gen/", namespaceDirectory)), false);
      assert.equal(existsSync(new URL("1.0.0/gen/", namespaceDirectory)), false);
    });
  }

  it("PrR-CXD-026: an access map with the text 18 February 2027 as validFrom fails", () => {
    const validate = compileGeneratedSchema("BatteryPassportAccessMap");
    const accessMap = readExample("BatteryPassportAccessMap");
    accessMap.validFrom = "18 February 2027";
    assert.equal(validate(accessMap), false);
    assert.ok(validate.errors.some((error) => error.keyword === "format" && error.instancePath === "/validFrom"), JSON.stringify(validate.errors));
  });

  it("PrR-CXD-026: an access map with an unknown access group fails", () => {
    const validate = compileGeneratedSchema("BatteryPassportAccessMap");
    const accessMap = readExample("BatteryPassportAccessMap");
    accessMap.entries[0].accessGroup = "everyone";
    assert.equal(validate(accessMap), false);
    assert.ok(validate.errors.some((error) => error.keyword === "enum" && error.instancePath === "/entries/0/accessGroup"), JSON.stringify(validate.errors));
  });

  it("PrR-CXD-026: an access map without entries fails", () => {
    const validate = compileGeneratedSchema("BatteryPassportAccessMap");
    const accessMap = readExample("BatteryPassportAccessMap");
    delete accessMap.entries;
    assert.equal(validate(accessMap), false);
    assert.ok(validate.errors.some((error) => error.keyword === "required" && error.params.missingProperty === "entries"), JSON.stringify(validate.errors));
  });

  it("PrR-CXD-026: a lifecycle payload with a Business Partner Number of 5 characters fails", () => {
    const validate = compileGeneratedSchema("BatteryPassportLifecycle");
    const lifecycle = readExample("BatteryPassportLifecycle");
    lifecycle.predecessors[0].dataProviderBpnl = "BPNL1";
    assert.equal("BPNL1".length, 5);
    assert.equal(validate(lifecycle), false);
    assert.ok(validate.errors.some((error) => error.keyword === "pattern" && error.instancePath === "/predecessors/0/dataProviderBpnl"), JSON.stringify(validate.errors));
  });

  it("PrR-CXD-026: each stored schema file *-schema.json below sources/IDTA compiles", () => {
    const storedSchemaFiles = listFiles(STORED_IDTA_DIRECTORY, "-schema.json");
    assert.ok(storedSchemaFiles.length >= 4, `sources/IDTA holds ${storedSchemaFiles.length} schema files`);
    for (const storedSchemaFile of storedSchemaFiles) {
      assert.equal(typeof createAspectSchemaCompiler().compile(readJson(storedSchemaFile)), "function", fileURLToPath(storedSchemaFile));
    }
  });

  it("PrR-CXD-026: a compiler of ajv-draft-04 in strict mode without the two keywords of SAMM_SCHEMA_KEYWORDS throws for a generated schema", () => {
    for (const { aspect } of MODELS) {
      const compilerWithoutKeywords = new Ajv04({ strict: true, allErrors: true });
      addFormats(compilerWithoutKeywords);
      assert.throws(() => compilerWithoutKeywords.compile(readGeneratedSchema(aspect)), /strict mode: unknown keyword/, aspect);
    }
  });

  it("PrR-CXD-026: the example payload of section 3.2.2 of the proposal equals the example file of the lifecycle model", () => {
    const proposal = readFileSync(PROPOSAL_FILE, "utf8");
    assert.deepEqual(firstJsonBlockAfterHeading(proposal, "#### 3.2.2 PROPERTIES"), readExample("BatteryPassportLifecycle"));
  });

  it("PrR-CXD-026: the example payload of section 3.4.2 of the proposal equals the example file of the access map model", () => {
    const proposal = readFileSync(PROPOSAL_FILE, "utf8");
    assert.deepEqual(firstJsonBlockAfterHeading(proposal, "#### 3.4.2 PROPERTIES"), readExample("BatteryPassportAccessMap"));
  });

  it("PrR-CXD-026: the example file of the successors model equals the block of section 21 of the implementation specification", () => {
    const annexFiles = readAnnexFiles(readFileSync(SPECIFICATION_FILE, "utf8"));
    const annexFile = annexFiles.find((file) => file.path === "docs/api/aspects/BatteryPassportSuccessors.json");
    assert.ok(annexFile, "section 21 holds no block of docs/api/aspects/BatteryPassportSuccessors.json");
    assert.equal(annexFile.phase, 2);
    const exampleText = readFileSync(new URL("BatteryPassportSuccessors.json", ASPECTS_DIRECTORY), "utf8").replace(/\r\n/g, "\n");
    assert.equal(exampleText, annexFile.content);
    assert.deepEqual(JSON.parse(annexFile.content), readExample("BatteryPassportSuccessors"));
  });
});
