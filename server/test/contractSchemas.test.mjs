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

// Tests the contract of the lifecycle notification API: the eight schema files of
// docs/api/schemas and the file docs/api/openAPI.yaml.
//
// Requirements of the registry that this file verifies:
//   PrR-CXD-018 (Lifecycle notification API specified in docs/api/openAPI.yaml, OpenAPI 3.1.0)
//   PrR-CXD-019 (Four notification operations with JSON schemas, following the Industry Core KIT)
//   PrR-CXD-020 (Notification responses 200, 4xx and 5xx with the error body of Q-409)
// Lessons of docs/lessons-from-a-first-implementation.md that this file excludes:
//   lesson 5 (NewPassportIssued reports a status of the original passport)
//   lesson 10 (the notification uses a format of the implementation)
//   lesson 11 (the recycling notice leaves out mandatory content)
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { parse as parseYaml } from "yaml";

const SCHEMA_DIRECTORY = new URL("../../docs/api/schemas/", import.meta.url);
const OPENAPI_FILE = new URL("../../docs/api/openAPI.yaml", import.meta.url);

const SCHEMA_FILES = [
  "MessageHeader.schema.json",
  "LifecycleNotification.schema.json",
  "NewPassportIssued.schema.json",
  "BatteryRepaired.schema.json",
  "BatteryBecameWaste.schema.json",
  "PassportEnded.schema.json",
  "NotificationAccepted.schema.json",
  "ErrorResponse.schema.json",
];

const HEADER_REQUIRED = ["messageId", "context", "sentDateTime", "senderBpn", "receiverBpn", "version"];
const RESPONSE_STATUSES = ["200", "400", "401", "403", "404", "405", "409", "413", "422", "500"];

const LOWER_UUID = "0b2f1c7e-6d3a-4f5b-8c9d-1e2f3a4b5c6d";
const UUID_FORMS = [
  LOWER_UUID,
  LOWER_UUID.toUpperCase(),
  `urn:uuid:${LOWER_UUID}`,
  `urn:uuid:${LOWER_UUID.toUpperCase()}`,
];
// Invented test data: no value names a real company.
const SENDER_BPNL = "BPNL00000000SEND";
const RECEIVER_BPNL = "BPNL00000000RECV";
const THIRD_BPNL = "BPNL00000000THRD";

// The four operations with the context of Table 4.3 and the content of Table 4.4 of the proposal CX-0160-4.
const OPERATIONS = [
  {
    name: "NewPassportIssued",
    context: "BatteryPass-BatteryPassLifecycleNotificationAPI-NewPassportIssued:1",
    required: ["passportIdentifier", "catenaXId", "operation", "operationDate", "predecessorPassportIdentifier"],
    passportIdentifiers: ["passportIdentifier", "predecessorPassportIdentifier"],
    dates: ["operationDate"],
    identifiers: ["catenaXId"],
    bpnls: [],
    content: {
      passportIdentifier: "did:web:second-life.example:passport:new-0001",
      catenaXId: `urn:uuid:${LOWER_UUID}`,
      operation: "repurposing",
      operationDate: "2027-03-01T09:30:00Z",
      predecessorPassportIdentifier: "did:web:manufacturer.example:passport:original-0001",
    },
  },
  {
    name: "BatteryRepaired",
    context: "BatteryPass-BatteryPassLifecycleNotificationAPI-BatteryRepaired:1",
    required: ["passportIdentifier", "repairDate", "repairCertificateCatenaXId"],
    passportIdentifiers: ["passportIdentifier"],
    dates: ["repairDate"],
    identifiers: ["repairCertificateCatenaXId"],
    bpnls: [],
    content: {
      passportIdentifier: "did:web:manufacturer.example:passport:original-0001",
      repairDate: "2027-03-01T09:30:00Z",
      repairCertificateCatenaXId: `urn:uuid:${LOWER_UUID}`,
    },
  },
  {
    name: "BatteryBecameWaste",
    context: "BatteryPass-BatteryPassLifecycleNotificationAPI-BatteryBecameWaste:1",
    required: ["passportIdentifier", "successorBpnl", "successorRole", "date"],
    passportIdentifiers: ["passportIdentifier"],
    dates: ["date"],
    identifiers: [],
    bpnls: ["successorBpnl"],
    content: {
      passportIdentifier: "did:web:manufacturer.example:passport:original-0001",
      successorBpnl: THIRD_BPNL,
      successorRole: "wasteManagementOperator",
      date: "2027-03-01T09:30:00Z",
    },
  },
  {
    name: "PassportEnded",
    context: "BatteryPass-BatteryPassLifecycleNotificationAPI-PassportEnded:1",
    required: ["passportIdentifier", "recyclingDate", "recyclerBpnl"],
    passportIdentifiers: ["passportIdentifier"],
    dates: ["recyclingDate"],
    identifiers: ["materialRecyclingCertificateCatenaXId"],
    bpnls: ["recyclerBpnl"],
    content: {
      passportIdentifier: "did:web:manufacturer.example:passport:original-0001",
      recyclingDate: "2027-03-01T09:30:00Z",
      recyclerBpnl: SENDER_BPNL,
      materialRecyclingCertificateCatenaXId: `urn:uuid:${LOWER_UUID}`,
    },
  },
];

function readSchema(fileName) {
  return JSON.parse(readFileSync(new URL(fileName, SCHEMA_DIRECTORY), "utf8"));
}

const schemas = new Map(SCHEMA_FILES.map((fileName) => [fileName, readSchema(fileName)]));

// The validator of the 2020-12 dialect in strict mode with the formats of ajv-formats.
function createValidator() {
  const ajv = new Ajv2020({ strict: true, allErrors: true });
  addFormats(ajv);
  for (const schema of schemas.values()) ajv.addSchema(schema);
  return ajv;
}

const ajv = createValidator();

function validatorOf(reference) {
  const validate = ajv.getSchema(reference);
  assert.ok(validate, `the validator holds no schema with the reference ${reference}`);
  return validate;
}

const validateNotification = validatorOf("LifecycleNotification.schema.json");

function validMessage(operation) {
  return {
    header: {
      messageId: `urn:uuid:${LOWER_UUID}`,
      context: operation.context,
      sentDateTime: "2027-03-01T10:00:00Z",
      senderBpn: SENDER_BPNL,
      receiverBpn: RECEIVER_BPNL,
      version: "3.0.0",
    },
    content: structuredClone(operation.content),
  };
}

// Returns a valid message of the operation after the change that the caller states.
function changedMessage(operation, change) {
  const message = validMessage(operation);
  change(message);
  return message;
}

function assertAccepted(operation, message, label) {
  const validateOperation = validatorOf(`LifecycleNotification.schema.json#/$defs/${operation.name}`);
  assert.equal(
    validateOperation(message),
    true,
    `${operation.name}, ${label}: the envelope definition refuses the message: ${JSON.stringify(validateOperation.errors)}`,
  );
  assert.equal(
    validateNotification(message),
    true,
    `${operation.name}, ${label}: LifecycleNotification.schema.json refuses the message: ${JSON.stringify(validateNotification.errors)}`,
  );
}

function assertRefused(operation, message, label) {
  const validateOperation = validatorOf(`LifecycleNotification.schema.json#/$defs/${operation.name}`);
  assert.equal(validateOperation(message), false, `${operation.name}, ${label}: the envelope definition accepts the message`);
  assert.equal(validateNotification(message), false, `${operation.name}, ${label}: LifecycleNotification.schema.json accepts the message`);
}

// Collects the path of every property, at every depth, that carries no description.
function propertiesWithoutDescription(node, path, missing) {
  if (Array.isArray(node)) {
    node.forEach((item, index) => propertiesWithoutDescription(item, `${path}/${index}`, missing));
    return missing;
  }
  if (node === null || typeof node !== "object") return missing;
  for (const [key, value] of Object.entries(node)) {
    if (key === "properties" && value !== null && typeof value === "object" && !Array.isArray(value)) {
      for (const [propertyName, propertySchema] of Object.entries(value)) {
        const propertyPath = `${path}/properties/${propertyName}`;
        const description = propertySchema === null || typeof propertySchema !== "object" ? undefined : propertySchema.description;
        if (typeof description !== "string" || description.trim().length === 0) missing.push(propertyPath);
        propertiesWithoutDescription(propertySchema, propertyPath, missing);
      }
    } else if (key !== "enum" && key !== "const" && key !== "required") {
      propertiesWithoutDescription(value, `${path}/${key}`, missing);
    }
  }
  return missing;
}

describe("PrR-CXD-019 (Four notification operations with JSON schemas, following the Industry Core KIT): the eight schema files", () => {
  it("PrR-CXD-019: the folder docs/api/schemas declares the 2020-12 dialect, the file name as $id, a title and a description in each of the eight schema files", () => {
    assert.equal(schemas.size, 8);
    for (const [fileName, schema] of schemas) {
      assert.equal(schema.$schema, "https://json-schema.org/draft/2020-12/schema", fileName);
      assert.equal(schema.$id, fileName, fileName);
      assert.equal(typeof schema.title, "string", fileName);
      assert.ok(schema.title.length > 0, fileName);
      assert.equal(typeof schema.description, "string", fileName);
      assert.ok(schema.description.length > 0, fileName);
    }
  });

  it("PrR-CXD-019: the eight schemas compile in the 2020-12 dialect in strict mode with the formats of ajv-formats", () => {
    const strictValidator = createValidator();
    for (const fileName of SCHEMA_FILES) {
      assert.equal(typeof strictValidator.getSchema(fileName), "function", `${fileName} does not compile`);
    }
    for (const operation of OPERATIONS) {
      const reference = `LifecycleNotification.schema.json#/$defs/${operation.name}`;
      assert.equal(typeof strictValidator.getSchema(reference), "function", `${reference} does not compile`);
    }
  });

  it("PrR-CXD-019: every property of the eight schema files, at every depth, carries a description", () => {
    for (const [fileName, schema] of schemas) {
      assert.deepEqual(propertiesWithoutDescription(schema, fileName, []), [], `${fileName} holds a property without a description`);
    }
  });

  it("PrR-CXD-019: the description check reports a property without a description at a nested depth", () => {
    const schemaWithGap = {
      properties: {
        outer: { description: "The outer property.", items: { properties: { inner: { type: "string" } } } },
      },
    };
    assert.deepEqual(propertiesWithoutDescription(schemaWithGap, "probe", []), ["probe/properties/outer/items/properties/inner"]);
  });

  it("PrR-CXD-019: the header schema requires the six properties of the message header, and each content schema requires the properties of Table 4.4 of the proposal", () => {
    assert.deepEqual(schemas.get("MessageHeader.schema.json").required, HEADER_REQUIRED);
    assert.equal(schemas.get("MessageHeader.schema.json").additionalProperties, false);
    for (const operation of OPERATIONS) {
      const contentSchema = schemas.get(`${operation.name}.schema.json`);
      assert.deepEqual(contentSchema.required, operation.required, operation.name);
      assert.equal(contentSchema.additionalProperties, false, operation.name);
    }
  });

  it("Lesson 5 (NewPassportIssued reports a status of the original passport): the content schema of NewPassportIssued holds no status property", () => {
    const propertyNames = Object.keys(schemas.get("NewPassportIssued.schema.json").properties);
    assert.deepEqual(propertyNames, ["passportIdentifier", "catenaXId", "operation", "operationDate", "predecessorPassportIdentifier"]);
    assert.deepEqual(propertyNames.filter((propertyName) => /status/i.test(propertyName)), []);
    const operation = OPERATIONS[0];
    assertRefused(operation, changedMessage(operation, (message) => { message.content.status = "repurposed"; }), "a content with the property status");
    assertRefused(operation, changedMessage(operation, (message) => { message.content.lifecycleStatus = "repurposed"; }), "a content with the property lifecycleStatus");
  });

  it("Lesson 11 (the recycling notice leaves out mandatory content): the content schema of PassportEnded requires the passport identifier, the recycling date and the recycler, and only the material recycling certificate is optional", () => {
    const contentSchema = schemas.get("PassportEnded.schema.json");
    assert.deepEqual(contentSchema.required, ["passportIdentifier", "recyclingDate", "recyclerBpnl"]);
    assert.deepEqual(
      Object.keys(contentSchema.properties).filter((propertyName) => !contentSchema.required.includes(propertyName)),
      ["materialRecyclingCertificateCatenaXId"],
    );
    const operation = OPERATIONS[3];
    assertAccepted(operation, changedMessage(operation, (message) => { delete message.content.materialRecyclingCertificateCatenaXId; }), "a content without the optional certificate");
  });
});

for (const operation of OPERATIONS) {
  describe(`PrR-CXD-019 (Four notification operations with JSON schemas, following the Industry Core KIT): the message of the operation ${operation.name}`, () => {
    it(`PrR-CXD-019: one valid message of ${operation.name} validates against the envelope definition of the operation and against LifecycleNotification.schema.json`, () => {
      assertAccepted(operation, validMessage(operation), "the valid message");
    });

    it(`PrR-CXD-019: a message of ${operation.name} with a third top-level property fails`, () => {
      assertRefused(operation, changedMessage(operation, (message) => { message.signature = "none"; }), "a third top-level property");
    });

    it(`PrR-CXD-019: a message of ${operation.name} without content fails, and a message without header fails`, () => {
      assertRefused(operation, changedMessage(operation, (message) => { delete message.content; }), "no content");
      assertRefused(operation, changedMessage(operation, (message) => { delete message.header; }), "no header");
    });

    it(`PrR-CXD-019: a message of ${operation.name} with the context of another operation fails`, () => {
      for (const other of OPERATIONS.filter((candidate) => candidate.name !== operation.name)) {
        assertRefused(operation, changedMessage(operation, (message) => { message.header.context = other.context; }), `the context of ${other.name}`);
      }
      assertRefused(operation, changedMessage(operation, (message) => { message.header.context = "BatteryPass-BatteryPassLifecycleNotificationAPI-Unknown:1"; }), "an unknown context");
    });

    it(`PrR-CXD-019: a message of ${operation.name} without each required property of the header fails`, () => {
      for (const propertyName of HEADER_REQUIRED) {
        assertRefused(operation, changedMessage(operation, (message) => { delete message.header[propertyName]; }), `no header property ${propertyName}`);
      }
    });

    it(`PrR-CXD-019: a message of ${operation.name} without each required property of the content fails`, () => {
      for (const propertyName of operation.required) {
        assertRefused(operation, changedMessage(operation, (message) => { delete message.content[propertyName]; }), `no content property ${propertyName}`);
      }
    });

    it(`PrR-CXD-019: a message of ${operation.name} with a further content property fails, and a message with a further header property fails`, () => {
      assertRefused(operation, changedMessage(operation, (message) => { message.content.remark = "a further property"; }), "a further content property");
      assertRefused(operation, changedMessage(operation, (message) => { message.header.remark = "a further property"; }), "a further header property");
    });

    it(`PrR-CXD-019: a message of ${operation.name} with a Business Partner Number of 11 characters fails`, () => {
      // The Business Partner Number of a legal entity has the prefix BPNL and 12 further characters.
      // The test covers both readings of "11 characters": 11 characters after the prefix, and 11 characters in all.
      const bpnlWithElevenFurtherCharacters = "BPNL00000000SEN";
      const bpnlOfElevenCharacters = "BPNL0000SEN";
      assert.equal(bpnlWithElevenFurtherCharacters.length, 15);
      assert.equal(bpnlOfElevenCharacters.length, 11);
      for (const value of [bpnlWithElevenFurtherCharacters, bpnlOfElevenCharacters]) {
        assertRefused(operation, changedMessage(operation, (message) => { message.header.senderBpn = value; }), `senderBpn ${value}`);
        assertRefused(operation, changedMessage(operation, (message) => { message.header.receiverBpn = value; }), `receiverBpn ${value}`);
        for (const propertyName of operation.bpnls) {
          assertRefused(operation, changedMessage(operation, (message) => { message.content[propertyName] = value; }), `${propertyName} ${value}`);
        }
      }
    });

    it(`PrR-CXD-019: a message of ${operation.name} with an identifier of 35 characters fails`, () => {
      const identifierOfThirtyFiveCharacters = LOWER_UUID.slice(0, 35);
      assert.equal(identifierOfThirtyFiveCharacters.length, 35);
      for (const value of [identifierOfThirtyFiveCharacters, `urn:uuid:${identifierOfThirtyFiveCharacters}`]) {
        assertRefused(operation, changedMessage(operation, (message) => { message.header.messageId = value; }), `messageId ${value}`);
        assertRefused(operation, changedMessage(operation, (message) => { message.header.relatedMessageId = value; }), `relatedMessageId ${value}`);
        for (const propertyName of operation.identifiers) {
          assertRefused(operation, changedMessage(operation, (message) => { message.content[propertyName] = value; }), `${propertyName} ${value}`);
        }
      }
    });

    it(`PrR-CXD-019: a message of ${operation.name} with a sentDateTime without a time zone, with a space in place of the letter T, or with the text tomorrow fails`, () => {
      assertRefused(operation, changedMessage(operation, (message) => { message.header.sentDateTime = "2027-03-01T10:00:00"; }), "a sentDateTime without a time zone");
      assertRefused(operation, changedMessage(operation, (message) => { message.header.sentDateTime = "2027-03-01 10:00:00Z"; }), "a sentDateTime with a space");
      assertRefused(operation, changedMessage(operation, (message) => { message.header.sentDateTime = "tomorrow"; }), "the text tomorrow as sentDateTime");
      assertRefused(operation, changedMessage(operation, (message) => { message.header.expectedResponseBy = "2027-03-01 10:00:00Z"; }), "an expectedResponseBy with a space");
    });

    it(`PrR-CXD-019: a message of ${operation.name} with a content date without a time zone, with a space in place of the letter T, or with the text tomorrow fails`, () => {
      assert.ok(operation.dates.length > 0);
      for (const propertyName of operation.dates) {
        assertRefused(operation, changedMessage(operation, (message) => { message.content[propertyName] = "2027-03-01T09:30:00"; }), `${propertyName} without a time zone`);
        assertRefused(operation, changedMessage(operation, (message) => { message.content[propertyName] = "2027-03-01 09:30:00Z"; }), `${propertyName} with a space`);
        assertRefused(operation, changedMessage(operation, (message) => { message.content[propertyName] = "tomorrow"; }), `the text tomorrow as ${propertyName}`);
      }
    });

    it(`PrR-CXD-019: a message of ${operation.name} with a sentDateTime with the offset +02:00 validates`, () => {
      assertAccepted(operation, changedMessage(operation, (message) => { message.header.sentDateTime = "2027-03-01T12:00:00+02:00"; }), "a sentDateTime with the offset +02:00");
      for (const propertyName of operation.dates) {
        assertAccepted(operation, changedMessage(operation, (message) => { message.content[propertyName] = "2027-03-01T11:30:00+02:00"; }), `${propertyName} with the offset +02:00`);
      }
    });

    it(`PrR-CXD-019: an identifier of a message of ${operation.name} validates in each of the four forms`, () => {
      assert.equal(UUID_FORMS.length, 4);
      for (const value of UUID_FORMS) {
        assertAccepted(operation, changedMessage(operation, (message) => { message.header.messageId = value; }), `messageId ${value}`);
        assertAccepted(operation, changedMessage(operation, (message) => { message.header.relatedMessageId = value; }), `relatedMessageId ${value}`);
        for (const propertyName of operation.identifiers) {
          assertAccepted(operation, changedMessage(operation, (message) => { message.content[propertyName] = value; }), `${propertyName} ${value}`);
        }
      }
    });

    it(`PrR-CXD-019: a passport identifier of 300 characters validates in a message of ${operation.name}, and an empty passport identifier fails`, () => {
      const passportIdentifierOfThreeHundredCharacters = "p".repeat(300);
      for (const propertyName of operation.passportIdentifiers) {
        assertAccepted(operation, changedMessage(operation, (message) => { message.content[propertyName] = passportIdentifierOfThreeHundredCharacters; }), `${propertyName} of 300 characters`);
        assertRefused(operation, changedMessage(operation, (message) => { message.content[propertyName] = ""; }), `an empty ${propertyName}`);
      }
    });

    it(`PrR-CXD-019: a message of ${operation.name} with a version of the header other than 3.0.0 fails`, () => {
      assertRefused(operation, changedMessage(operation, (message) => { message.header.version = "2.0.0"; }), "the version 2.0.0");
    });
  });
}

describe("PrR-CXD-020 (Notification responses 200, 4xx and 5xx with the error body of Q-409): the two response schemas", () => {
  const validateError = validatorOf("ErrorResponse.schema.json");
  const validateAccepted = validatorOf("NotificationAccepted.schema.json");

  function validErrorResponse() {
    return {
      success: false,
      error: { message: "The header of the notification names another receiver.", code: "ERR-RX-RECEIVER-MISMATCH" },
      messages: [
        {
          messageType: "Error",
          text: "The header of the notification names another receiver. The sender must send the notification to the receiver that the header names.",
        },
      ],
    };
  }

  it("PrR-CXD-020: ErrorResponse.schema.json accepts the error envelope together with the result object", () => {
    assert.equal(validateError(validErrorResponse()), true, JSON.stringify(validateError.errors));
  });

  it("PrR-CXD-020: ErrorResponse.schema.json refuses a further property in the response, in error and in an item of messages", () => {
    const furtherInResponse = validErrorResponse();
    furtherInResponse.data = {};
    assert.equal(validateError(furtherInResponse), false, "a further property in the response");
    const furtherInError = validErrorResponse();
    furtherInError.error.stack = "a further property";
    assert.equal(validateError(furtherInError), false, "a further property in error");
    const furtherInMessage = validErrorResponse();
    furtherInMessage.messages[0].code = "a further property";
    assert.equal(validateError(furtherInMessage), false, "a further property in an item of messages");
  });

  it("PrR-CXD-020: ErrorResponse.schema.json refuses a response without its body parts, with success true, with an empty text or with an empty list of messages", () => {
    for (const propertyName of ["success", "error", "messages"]) {
      const response = validErrorResponse();
      delete response[propertyName];
      assert.equal(validateError(response), false, `no property ${propertyName}`);
    }
    for (const propertyName of ["message", "code"]) {
      const withoutProperty = validErrorResponse();
      delete withoutProperty.error[propertyName];
      assert.equal(validateError(withoutProperty), false, `no property error.${propertyName}`);
      const withEmptyText = validErrorResponse();
      withEmptyText.error[propertyName] = "";
      assert.equal(validateError(withEmptyText), false, `an empty error.${propertyName}`);
    }
    const successTrue = validErrorResponse();
    successTrue.success = true;
    assert.equal(validateError(successTrue), false, "success true");
    const noMessages = validErrorResponse();
    noMessages.messages = [];
    assert.equal(validateError(noMessages), false, "an empty list of messages");
    const emptyText = validErrorResponse();
    emptyText.messages[0].text = "";
    assert.equal(validateError(emptyText), false, "an empty text of a message");
    const unknownType = validErrorResponse();
    unknownType.messages[0].messageType = "Notice";
    assert.equal(validateError(unknownType), false, "an unknown messageType");
    for (const messageType of ["Error", "Warning", "Info", "Exception"]) {
      const response = validErrorResponse();
      response.messages[0].messageType = messageType;
      assert.equal(validateError(response), true, `the messageType ${messageType}`);
    }
  });

  it("PrR-CXD-020: NotificationAccepted.schema.json accepts the three outcomes and refuses another outcome, a missing property and a further property", () => {
    for (const outcome of ["applied", "recorded", "duplicate"]) {
      assert.equal(validateAccepted({ messageId: `urn:uuid:${LOWER_UUID}`, outcome }), true, outcome);
    }
    assert.equal(validateAccepted({ messageId: `urn:uuid:${LOWER_UUID}`, outcome: "rejected" }), false, "another outcome");
    assert.equal(validateAccepted({ outcome: "applied" }), false, "no messageId");
    assert.equal(validateAccepted({ messageId: `urn:uuid:${LOWER_UUID}` }), false, "no outcome");
    assert.equal(validateAccepted({ messageId: LOWER_UUID.slice(0, 35), outcome: "applied" }), false, "a messageId of 35 characters");
    assert.equal(validateAccepted({ messageId: `urn:uuid:${LOWER_UUID}`, outcome: "applied", success: true }), false, "a further property");
  });
});

describe("PrR-CXD-018 (Lifecycle notification API specified in docs/api/openAPI.yaml, OpenAPI 3.1.0): the file docs/api/openAPI.yaml", () => {
  const openApi = parseYaml(readFileSync(fileURLToPath(OPENAPI_FILE), "utf8"));

  it("PrR-CXD-018: docs/api/openAPI.yaml parses, declares OpenAPI 3.1.0 and holds the API version only in info.version", () => {
    assert.equal(openApi.openapi, "3.1.0");
    assert.equal(openApi.info.title, "Battery Passport Lifecycle Notification API");
    assert.equal(openApi.info.version, "1.0.0");
    assert.deepEqual(openApi.info.license, { name: "CC-BY-4.0", identifier: "CC-BY-4.0" });
    for (const path of Object.keys(openApi.paths)) {
      assert.doesNotMatch(path, /\/v[0-9]+(\/|$)/, `the path ${path} holds a version`);
    }
    assert.doesNotMatch(openApi.servers[0].url, /\/v[0-9]+(\/|$)/, "the server address holds a version");
  });

  it("PrR-CXD-019: docs/api/openAPI.yaml holds exactly four paths, each with one post operation whose operationId equals the path name and whose request body references the envelope definition of the operation", () => {
    assert.deepEqual(Object.keys(openApi.paths), OPERATIONS.map((operation) => `/${operation.name}`));
    for (const operation of OPERATIONS) {
      const pathItem = openApi.paths[`/${operation.name}`];
      assert.deepEqual(Object.keys(pathItem), ["post"], `the path /${operation.name} holds another key than post`);
      assert.equal(pathItem.post.operationId, operation.name);
      assert.deepEqual(pathItem.post.tags, ["LifecycleNotification"]);
      assert.equal(pathItem.post.requestBody.required, true, `the request body of ${operation.name} is not required`);
      assert.deepEqual(Object.keys(pathItem.post.requestBody.content), ["application/json"]);
      assert.deepEqual(pathItem.post.requestBody.content["application/json"].schema, {
        $ref: `schemas/LifecycleNotification.schema.json#/$defs/${operation.name}`,
      });
      assert.ok(pathItem.post.description.includes(operation.context), `the description of ${operation.name} does not name the context`);
    }
  });

  it("PrR-CXD-020: each operation of docs/api/openAPI.yaml holds the ten responses 200, 400, 401, 403, 404, 405, 409, 413, 422 and 500, and each response references its body schema", () => {
    assert.equal(Object.keys(openApi.components.responses).length, 10);
    for (const operation of OPERATIONS) {
      const responses = openApi.paths[`/${operation.name}`].post.responses;
      assert.deepEqual(Object.keys(responses), RESPONSE_STATUSES, operation.name);
      for (const status of RESPONSE_STATUSES) {
        const reference = responses[status].$ref;
        assert.match(reference, /^#\/components\/responses\/[A-Za-z]+$/, `${operation.name} ${status}`);
        const response = openApi.components.responses[reference.slice("#/components/responses/".length)];
        assert.ok(response, `${operation.name} ${status}: the response ${reference} is not defined`);
        assert.equal(typeof response.description, "string");
        assert.ok(response.description.length > 0);
        assert.deepEqual(
          response.content["application/json"].schema,
          { $ref: status === "200" ? "schemas/NotificationAccepted.schema.json" : "schemas/ErrorResponse.schema.json" },
          `${operation.name} ${status}`,
        );
      }
    }
  });

  it("PrR-CXD-018: the server variable baseUrl of docs/api/openAPI.yaml has its default", () => {
    assert.equal(openApi.servers.length, 1);
    assert.equal(openApi.servers[0].url, "{baseUrl}/api/lifecycle-notifications");
    assert.equal(openApi.servers[0].variables.baseUrl.default, "https://provider.example");
  });

  it("PrR-CXD-018: docs/api/openAPI.yaml holds no security scheme and no security entry", () => {
    assert.equal(Object.hasOwn(openApi, "security"), false);
    assert.equal(Object.hasOwn(openApi.components, "securitySchemes"), false);
    for (const operation of OPERATIONS) {
      assert.equal(Object.hasOwn(openApi.paths[`/${operation.name}`].post, "security"), false, operation.name);
    }
  });

  it("PrR-CXD-019: every schema reference of docs/api/openAPI.yaml names a schema that the validator of the eight schema files holds", () => {
    const references = [];
    (function collect(node) {
      if (Array.isArray(node)) {
        node.forEach(collect);
        return;
      }
      if (node === null || typeof node !== "object") return;
      for (const [key, value] of Object.entries(node)) {
        if (key === "$ref" && typeof value === "string" && value.startsWith("schemas/")) references.push(value);
        else collect(value);
      }
    })(openApi);
    assert.equal(references.length, 14);
    for (const reference of references) {
      assert.equal(typeof ajv.getSchema(reference.slice("schemas/".length)), "function", reference);
    }
  });
});
