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

// Requirement: PrR-CXD-026 (Three proposed models in the sldt-semantic-models layout).
// The one compiler of the aspect schemas in the draft-04 dialect of JSON Schema: the three
// schemas that the SAMM command line tool generates and the stored schemas of sources/IDTA.
import Ajv04 from "ajv-draft-04";
import addFormats from "ajv-formats";

// The two keywords that a schema of the SAMM command line tool holds beside the draft-04
// vocabulary. "x-samm-aspect-model-urn" is an annotation, and "components" holds the
// definitions that the references "#/components/schemas/<name>" of the schema name.
export const SAMM_SCHEMA_KEYWORDS = Object.freeze(["x-samm-aspect-model-urn", "components"]);

// Returns a new compiler in strict mode, so that every other unknown keyword and every unknown
// format of a schema fails the compilation. The compiler collects every error of a payload.
export function createAspectSchemaCompiler() {
  const compiler = new Ajv04({ strict: true, allErrors: true });
  addFormats(compiler);
  for (const keyword of SAMM_SCHEMA_KEYWORDS) compiler.addKeyword(keyword);
  return compiler;
}
