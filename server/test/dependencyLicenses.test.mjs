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

// Tests the licence check of the locked packages, scripts/check-dependency-licenses.mjs.
// The registry holds no requirement on the licences of the packages. Section 9.8 (Packages, tools, images
// and their licences) of the implementation specification states the rule that this file tests.
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, describe, it } from "node:test";

import { ADMITTED_LICENCES, licencePasses, listLockedPackages } from "../../scripts/check-dependency-licenses.mjs";

describe("Section 9.8 (Packages, tools, images and their licences): the licence check of the locked packages", () => {
  let directory;

  // The fixture is built at run time, because git ignores every folder node_modules.
  before(() => {
    directory = mkdtempSync(join(tmpdir(), "dependency-licences-"));
    const writeJson = (path, value) => {
      mkdirSync(join(directory, path, ".."), { recursive: true });
      writeFileSync(join(directory, path), JSON.stringify(value, null, 2));
    };
    writeJson("package-lock.json", {
      name: "fixture",
      lockfileVersion: 3,
      packages: {
        "": { name: "fixture", dependencies: { first: "1.0.0", second: "1.0.0" } },
        "node_modules/first": { version: "1.0.0" },
        "node_modules/second": { version: "1.0.0" },
      },
    });
    writeJson("node_modules/first/package.json", { name: "first", version: "1.0.0", license: "MIT" });
    writeJson("node_modules/second/package.json", { name: "second", version: "1.0.0", license: "GPL-3.0-only" });
    // A nested file without a licence, which the lock file does not name and which the script must not read.
    writeJson("node_modules/first/node_modules/nested/package.json", { name: "nested", version: "1.0.0" });
  });

  after(() => {
    if (directory) rmSync(directory, { recursive: true, force: true });
  });

  it("Section 9.8: listLockedPackages returns the two keys of the lock file and not the nested file", () => {
    assert.deepEqual(listLockedPackages(directory), ["node_modules/first", "node_modules/second"]);
  });

  it("Section 9.8: licencePasses admits each listed licence", () => {
    assert.deepEqual([...ADMITTED_LICENCES], ["MIT", "ISC", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "0BSD", "BlueOak-1.0.0", "CC0-1.0"]);
    for (const licence of ADMITTED_LICENCES) assert.equal(licencePasses(licence), true, licence);
  });

  it("Section 9.8: licencePasses refuses an unlisted licence", () => {
    for (const licence of ["GPL-3.0-only", "AGPL-3.0", "MPL-2.0", "UNLICENSED", "SEE LICENSE IN LICENSE.txt", "mit", ""]) {
      assert.equal(licencePasses(licence), false, licence);
    }
  });

  it("Section 9.8: licencePasses admits an OR expression with one listed alternative and refuses an OR expression without one", () => {
    assert.equal(licencePasses("(MIT OR GPL-3.0-only)"), true);
    assert.equal(licencePasses("GPL-3.0-only OR Apache-2.0"), true);
    assert.equal(licencePasses("(GPL-2.0-only OR GPL-3.0-only)"), false);
  });

  it("Section 9.8: licencePasses refuses an AND expression with one unlisted part and admits an AND expression of listed parts", () => {
    assert.equal(licencePasses("(MIT AND GPL-3.0-only)"), false);
    assert.equal(licencePasses("MIT AND GPL-3.0-only"), false);
    assert.equal(licencePasses("(MIT AND BSD-3-Clause)"), true);
  });

  it("Section 9.8: licencePasses refuses a missing field and a value that is not a string", () => {
    assert.equal(licencePasses(undefined), false);
    assert.equal(licencePasses(null), false);
    assert.equal(licencePasses({ type: "MIT" }), false);
    assert.equal(licencePasses(["MIT"]), false);
    assert.equal(licencePasses(42), false);
  });
});
