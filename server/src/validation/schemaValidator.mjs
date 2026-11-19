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

// Requirements: SwR-CXCLIENT-059 (Notifications built to CX-0151 and sent as JSON POST) and
// SwR-BACKEND-148 (Notification answered 200 when accepted, 4xx or 5xx otherwise), with decision D21
// (One definition of the message), decision D28 (Supplied payloads) and decision D64 (The generated
// schemas outside models/, and one compiler of the draft-04 schemas). Sections 9.1, 10.1, 10.2 and
// 10.6 of docs/architecture/implementation_plan.md.
// The one validator of the reference server (EL-BACKEND, the HTTP API): the eight schemas of
// docs/api/schemas and the eleven schemas of server/schemas in the 2020-12 dialect, and the stored and
// the generated aspect schemas in the draft-04 dialect. The function createSchemaValidator reads the
// schema files; importing the module reads no file.
import { readFileSync } from "node:fs";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import { ASPECTS } from "../submodels/submodelService.mjs";
import { createAspectSchemaCompiler } from "./aspectSchemaCompiler.mjs";

const CONTRACT_DIRECTORY = new URL("../../../docs/api/schemas/", import.meta.url);
const REQUEST_DIRECTORY = new URL("../../schemas/", import.meta.url);

export const CONTRACT_SCHEMA_FILES = Object.freeze([
  "MessageHeader.schema.json",
  "LifecycleNotification.schema.json",
  "NewPassportIssued.schema.json",
  "BatteryRepaired.schema.json",
  "BatteryBecameWaste.schema.json",
  "PassportEnded.schema.json",
  "NotificationAccepted.schema.json",
  "ErrorResponse.schema.json",
]);

// The eleven request bodies of the operator endpoints of section 10.2.
export const REQUEST_SCHEMAS = Object.freeze([
  "batteryModel",
  "createPassport",
  "issueNewPassport",
  "reportRepair",
  "reportWaste",
  "reportRecycling",
  "forwardLink",
  "accessRecord",
  "purchaserChange",
  "successorAuthorisation",
  "issuerContract",
]);

const OPERATION_NAMES = ["NewPassportIssued", "BatteryRepaired", "BatteryBecameWaste", "PassportEnded"];

function readJson(url) {
  return JSON.parse(readFileSync(url, "utf8"));
}

// One message of the result object of AAS Part 2 per validator error: the instance path and the
// validator message.
export function validatorMessages(errors) {
  return (errors ?? []).map((error) => `${error.instancePath === "" ? "/" : error.instancePath} ${error.message}`);
}

function outcome(validate, value) {
  const valid = validate(value);
  return { valid, errors: valid ? [] : [...validate.errors] };
}

// Returns the validator. Each method returns { valid, errors }, where errors holds the errors of the
// validator in the form of the library ajv.
export function createSchemaValidator() {
  // The 2020-12 dialect in strict mode. The option multipleOfPrecision lets a decimal value such as
  // 0.07 pass the keyword multipleOf 0.01, which the division of two binary numbers misses otherwise.
  const contract = new Ajv2020({ strict: true, allErrors: true, multipleOfPrecision: 9 });
  addFormats(contract);
  for (const file of CONTRACT_SCHEMA_FILES) contract.addSchema(readJson(new URL(file, CONTRACT_DIRECTORY)));
  for (const name of REQUEST_SCHEMAS) contract.addSchema(readJson(new URL(`${name}.schema.json`, REQUEST_DIRECTORY)));

  const messageValidators = new Map(OPERATION_NAMES.map((name) => [name, contract.getSchema(`LifecycleNotification.schema.json#/$defs/${name}`)]));
  const requestValidators = new Map(REQUEST_SCHEMAS.map((name) => [name, contract.getSchema(`${name}.schema.json`)]));
  const errorResponseValidator = contract.getSchema("ErrorResponse.schema.json");
  const acceptedValidator = contract.getSchema("NotificationAccepted.schema.json");

  const aspects = createAspectSchemaCompiler();
  const aspectValidators = new Map();
  for (const item of Object.values(ASPECTS)) {
    if (item.schemaFile !== null) aspectValidators.set(item.key, aspects.compile(readJson(item.schemaFile)));
  }

  return Object.freeze({
    // The envelope definition of an operation, LifecycleNotification.schema.json#/$defs/<Operation>.
    validateMessage(operation, body) {
      const validate = messageValidators.get(operation);
      if (validate === undefined) throw new TypeError("validateMessage needs one of the four operations");
      return outcome(validate, body);
    },
    // One request body of section 10.2, by the name of its schema.
    validateRequest(name, body) {
      const validate = requestValidators.get(name);
      if (validate === undefined) throw new TypeError("validateRequest needs the name of a schema of server/schemas");
      return outcome(validate, body);
    },
    // A payload of an aspect key. A key without a stored schema admits every payload (decision D28).
    validateAspect(aspectKey, payload) {
      const validate = aspectValidators.get(aspectKey);
      return validate === undefined ? { valid: true, errors: [] } : outcome(validate, payload);
    },
    hasAspectSchema(aspectKey) {
      return aspectValidators.has(aspectKey);
    },
    validateErrorResponse(body) {
      return outcome(errorResponseValidator, body);
    },
    validateNotificationAccepted(body) {
      return outcome(acceptedValidator, body);
    },
  });
}
