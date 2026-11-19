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

// Requirements: SwR-BACKEND-148 (Notification answered 200 when accepted, 4xx or 5xx otherwise) and
// SwR-BACKEND-206 (Lifecycle notification failures answered with envelope and result object), with
// decision D9 (The error body) and decision Q-409 (whether served aspect payloads skip the response
// envelope). Section 9.5 of docs/architecture/implementation_plan.md.
// The one source of the refusal ids, their statuses and their texts (EL-DATASET, the battery passport
// dataset), the refusal error and the mapping of a database error to a refusal.

function refusal(status, text) {
  return Object.freeze({ status, text });
}

// The refusals of section 9.5. Each text has four sentences: what happened, why the rule exists,
// who must act, and the next action.
export const REFUSALS = Object.freeze({
  "ERR-RX-HEADER-INVALID": refusal(
    400,
    "The notification was refused because its header does not validate against the MessageHeader schema. The receiver cannot identify the message, the sender or the receiver without a valid header. The sender must correct the header. Resend the notification with the fields that the following messages name.",
  ),
  "ERR-RX-CONTENT-INVALID": refusal(
    400,
    "The notification was refused because its content does not validate against the schema of its operation. The receiver applies only content that the published OpenAPI specification defines. The sender must correct the content. Resend the notification with the fields that the following messages name.",
  ),
  "ERR-RX-CHANGE-OUTSIDE-STEP": refusal(
    422,
    "The notification was refused because its content holds a property outside the content of its operation. The receiver changes a passport only through the step that the lifecycle notification API assigns to the operation. The sender must send only the properties of the operation. Resend the notification without the properties that the following messages name.",
  ),
  "ERR-RX-CONTEXT-MISMATCH": refusal(
    400,
    "The notification was refused because the header context does not name the operation of the endpoint. The receiver cannot tell which step to apply when the context and the endpoint differ. The sender must set the context of the operation. Resend the notification to the endpoint whose name the context carries.",
  ),
  "ERR-RX-RECEIVER-MISMATCH": refusal(
    400,
    "The notification was refused because the header names another company as receiver. A receiver accepts only the notifications addressed to its own Business Partner Number. The sender must address the notification to the receiver. Resend the notification with the receiver's Business Partner Number in the header.",
  ),
  "ERR-RX-SENDER-MISMATCH": refusal(
    403,
    "The notification was refused because the sender of the header differs from the participant that the connector presented. The receiver accepts a notification only from the participant that negotiated the contract. The sender must set its own Business Partner Number in the header. Resend the notification through the sender's own connector.",
  ),
  "ERR-RX-MESSAGE-ID-REUSED": refusal(
    409,
    "The notification was refused because a stored message of another sender or with another content carries the same messageId. A messageId identifies exactly one message. The sender must give each message a new messageId. Resend the notification with a new messageId.",
  ),
  "ERR-RX-PASSPORT-UNKNOWN": refusal(
    404,
    "The notification was refused because no passport of this data provider carries the named passport identifier. The receiver changes only passports of which the receiver is the data provider. The sender must check the passport identifier and the manufacturerId of the twin. Resend the notification to the data provider of that passport.",
  ),
  "ERR-RX-STEP-REFUSED": refusal(
    422,
    "The notification was refused because the current state of the passport does not admit the step of this operation. The receiver applies a lifecycle step only from the states that the step admits. The sender must check the state of the passport. Send the notification of the step that the current state admits.",
  ),
  "ERR-RX-METHOD-NOT-ALLOWED": refusal(
    405,
    "The request was refused because a notification endpoint accepts the method POST only. A notification API offers one POST endpoint per operation. The sender must use POST. Resend the notification with the method POST.",
  ),
  "ERR-RX-BODY-TOO-LARGE": refusal(
    413,
    "The notification was refused because its body is larger than one megabyte. The receiver reads only a body within its size limit. The sender must send a notification of the documented content only. Resend the notification with a body within the limit.",
  ),
  "ERR-RX-OPERATION-UNKNOWN": refusal(
    404,
    "The notification was refused because the receiver offers no notification endpoint at this path. A notification API offers one endpoint for each of its four operations. The sender must use the path of the operation of the notification. Resend the notification to the endpoint of its operation.",
  ),
  "ERR-RX-INTERNAL": refusal(
    500,
    "The notification was not applied because the receiver failed to store the notification. The receiver has recorded nothing of this message. The operator of the receiver must act, and the sender has nothing to correct. Resend the notification with the same messageId later.",
  ),
  "ERR-AC-UNAUTHENTICATED": refusal(
    401,
    "The request was refused because the request carries no valid data plane key and no valid operator token. The server answers only an authenticated subject. The caller must present its credential. Repeat the request with the credential.",
  ),
  "ERR-AC-CAPABILITY-MISSING": refusal(
    403,
    "The request was refused because the subject lacks the capability of this endpoint. Each endpoint requires one capability. The caller must use an endpoint of its subject kind. Repeat the request on an endpoint that the subject may call.",
  ),
  "ERR-AC-ACCESS-GROUP-REFUSED": refusal(
    403,
    "The data was not served because no record of the data provider admits the reader for this data. The data provider serves restricted information only to the readers that the data provider has recorded. The data provider must record the reader. Request the data again after the data provider has recorded the access.",
  ),
  "ERR-LC-BODY-INVALID": refusal(
    400,
    "The request was refused because its body or one of its path parameters does not validate against the schema of the endpoint. The server applies only a request that its schema defines. The operator must correct the request. Repeat the request with the fields that the following messages name.",
  ),
  "ERR-LC-BODY-TOO-LARGE": refusal(
    413,
    "The request was refused because its body is larger than one megabyte. The server reads only a body within its size limit. The operator must send a smaller body. Repeat the request with a body within the limit.",
  ),
  "ERR-LC-NOT-DATA-PROVIDER": refusal(
    403,
    "The action was refused because the company of this deployment is not the data provider of the passport. Only the data provider writes into a passport. The data provider must apply the change. Report the lifecycle event to the data provider through the lifecycle notification API.",
  ),
  "ERR-LC-PASSPORT-NOT-FOUND": refusal(
    404,
    "The action was refused because this deployment holds no passport with this id. A deployment holds only the passports of its own company. The operator must check the passport id. Repeat the request with the id of a passport of this deployment.",
  ),
  "ERR-LC-MODEL-NOT-FOUND": refusal(
    404,
    "The action was refused because this deployment holds no battery model with this id. A deployment holds only the battery models of its own company. The operator must check the battery model id. Repeat the request with the id of a battery model of this deployment.",
  ),
  "ERR-LC-RECORD-NOT-FOUND": refusal(
    404,
    "The action was refused because this deployment holds no record with this id. The request names a record by the id that the server returned. The operator must check the record id. Repeat the request with the id of a stored record.",
  ),
  "ERR-LC-RECORD-EXISTS": refusal(
    409,
    "The record was refused because an open record with the same recipient, aspect key and role exists. One open access record covers one recipient, one aspect key and one role. The operator has nothing to add. Read the open record, or end the open record first.",
  ),
  "ERR-LC-SUBMODEL-NOT-FOUND": refusal(
    404,
    "The submodel was not served because the passport or the battery model holds no payload of this aspect key. The data provider supplies each payload. The data provider must supply the payload. Request the submodel again after the data provider has supplied the payload.",
  ),
  "ERR-LC-ASPECT-KEY-UNKNOWN": refusal(
    404,
    "The request was refused because the server knows no aspect key of this name. The server serves only the aspect keys of its documented list. The caller must use a documented aspect key. Repeat the request with one of the documented aspect keys.",
  ),
  "ERR-LC-IDENTIFIER-EXISTS": refusal(
    409,
    "The request was refused because a stored record already carries this identifier. A passport identifier and a catalogue part identifier are unique in a deployment. The operator must choose another identifier. Repeat the request with an identifier that no stored record carries.",
  ),
  "ERR-LC-IDENTITY-PERMANENT": refusal(
    409,
    "The change was refused because the change would alter the identity of a passport or of a battery model. The identifiers and the manufacturer of a passport never change after the passport is issued. The operator has nothing to change. Issue a new passport where the regulation requires one.",
  ),
  "ERR-LC-OPERATION-NOT-ADMITTED": refusal(
    409,
    "The new passport was refused because the status or the purpose of a predecessor does not admit the operation. Each of the four operations is admitted only from the statuses and purposes of its rule. The second-life operator must choose the operation that the predecessor admits. Repeat the request with that operation.",
  ),
  "ERR-LC-MODEL-NOT-ORIGINAL": refusal(
    409,
    "The new passport was refused because the battery model of the request references the original battery model of no predecessor. A new passport keeps the battery model of the original battery as the reference of the design. The second-life operator must create a battery model that references the original model. Repeat the request with that battery model.",
  ),
  "ERR-LC-IDENTIFIER-RULE": refusal(
    409,
    "The new passport was refused because its passport identifier or its battery identifier breaks the identifier rule. A new passport has a new passport identifier, and the battery identifier is kept for one battery and renewed for a battery made from several batteries. The second-life operator must correct the identifiers. Repeat the request with identifiers that follow the rule.",
  ),
  "ERR-LC-STATUS-NOT-ADMITTED": refusal(
    409,
    "The action was refused because the state of the record does not admit the action. Each action is admitted only from the states of its rule. The operator must choose the action that the state admits. Read the record and repeat the request with that action.",
  ),
  "ERR-LC-PASSPORT-ENDED": refusal(
    409,
    "The action was refused because the passport has ended after the recycling of its battery. An ended passport accepts no further change. The operator has nothing to change on this passport. Read the ended passport as the passport stands.",
  ),
  "ERR-LC-SUCCESSOR-AUTHORISATION-MISSING": refusal(
    403,
    "The action was refused because the passport is waste and no written authorisation of the successor is in force today. After the waste status the data provider changes the passport only under the written authorisation of the successor. The data provider must record an authorisation that is in force. Repeat the request once the authorisation is recorded.",
  ),
  "ERR-LC-CERTIFICATE-NOT-REGISTERED": refusal(
    409,
    "The repair was not reported because the registry of this deployment holds no twin of the named repair certificate. The repairer registers the repair certificate before the repairer reports the repair. The repairer must register the certificate. Repeat the request after the certificate is registered.",
  ),
  "ERR-LC-NOTIFICATION-UNKNOWN": refusal(
    404,
    "The forward link was refused because no received NewPassportIssued notification for this passport carries the named messageId. A forward link follows only the notice of the second-life operator. The data provider must name a received notification. Read the received notifications and repeat the request with one messageId.",
  ),
  "ERR-LC-ROLE-NOT-ADMITTED": refusal(
    422,
    "The access record was refused because the role of the recipient is not admitted for this submodel. Each restricted submodel is offered only to the roles of its rule. The data provider must name a role that the rule admits. Repeat the request with an admitted role.",
  ),
  "ERR-LC-PATH-NOT-SUPPORTED": refusal(
    422,
    "The access map was refused because a path lies outside the supported subset of JSONPath. The server evaluates only the selectors of its documented subset. The data provider must write the path with those selectors. Repeat the request with the corrected path.",
  ),
  "ERR-LC-ACCESS-MAP-INCOMPLETE": refusal(
    422,
    "The request was refused because a served field has no entry in the access map or has entries of two access groups. The access map names exactly one access group for every served field. The data provider must complete the entries that the following messages name. Repeat the request once the access map holds one entry per field.",
  ),
  "ERR-LC-ACCESS-MAP-VERSION-EXISTS": refusal(
    409,
    "The access map was refused because the battery model already holds this map version. A stored version of an access map never changes. The data provider must choose a new map version. Repeat the request with a new value of mapVersion.",
  ),
  "ERR-LC-ISSUER-NOT-LINKED": refusal(
    422,
    "The contract was refused because the named issuer is not the data provider of a predecessor passport and the request carries no battery information, or carries battery information for a passport of this deployment. The information of an individual battery is offered only to the issuer of the passport or of an original passport. The operator must name that issuer or supply the information of the purchaser. Repeat the request with the Business Partner Number of a predecessor's data provider or with the product condition.",
  ),
  "ERR-LC-CONTRACT-EXISTS": refusal(
    409,
    "The contract was refused because an open contract for this passport, this issuer and this provider is already recorded. One open contract covers one passport and one pair of issuer and provider. The operator must end the open contract first. Repeat the request after the open contract has ended.",
  ),
  "ERR-LC-CONTRACT-NOT-FOUND": refusal(
    404,
    "The request was refused because this deployment holds no contract of this kind with this id. A deployment holds only the contracts that its own operator recorded. The operator must check the contract id. Repeat the request with the id of a recorded contract.",
  ),
  "ERR-LC-CONTRACT-ENDED": refusal(
    409,
    "The request was refused because the contract has ended. The information of an individual battery is shared only while the contract with the purchaser is recorded. The operator must record a new contract. Repeat the request after the new contract is recorded.",
  ),
  "ERR-LC-PATH-UNKNOWN": refusal(
    404,
    "The request was refused because the server offers no endpoint at this path. The server answers only the endpoints of its documented API. The caller must use a documented path. Repeat the request with a path of the API.",
  ),
  "ERR-LC-INTERNAL": refusal(
    500,
    "The action was not applied because the server failed. The server has stored nothing of this request. The operator of the server must act. Repeat the request later.",
  ),
});

// The refusal of a rule. The field messages holds the result object of AAS Part 2: first the text
// of the refusal, then one entry per further message, for example per validator error.
export class Refusal extends Error {
  constructor(id, { messages = [], auditEntries = [] } = {}) {
    const known = REFUSALS[id];
    if (known === undefined) throw new TypeError(`Refusal: ${id} is not a refusal id of section 9.5`);
    super(`${id}: ${known.text}`);
    this.name = "Refusal";
    this.id = id;
    this.status = known.status;
    this.messages = [{ messageType: "Error", text: known.text }, ...messages.map((message) => ({ messageType: "Error", text: String(message) }))];
    this.auditEntries = auditEntries;
  }
}

// The body of a refusal, the form of docs/api/schemas/ErrorResponse.schema.json.
export function refusalBody(refusalError) {
  const known = REFUSALS[refusalError.id];
  return {
    success: false,
    error: { message: known.text, code: refusalError.id },
    messages: refusalError.messages.map((message) => ({ messageType: message.messageType, text: message.text })),
  };
}

// The mapping of a database error to a refusal id, by the table of section 9.5. Each row names the
// refusal on an operator endpoint and the refusal on a receiving endpoint.
const OPERATOR = 0;
const RECEIVING = 1;
const RAISED = new Map([
  ["ERR-DB-IDENTITY-PERMANENT", ["ERR-LC-IDENTITY-PERMANENT", "ERR-RX-INTERNAL"]],
  ["ERR-DB-STATUS-CHANGE", ["ERR-LC-STATUS-NOT-ADMITTED", "ERR-RX-STEP-REFUSED"]],
  ["ERR-DB-END-DATE", ["ERR-LC-STATUS-NOT-ADMITTED", "ERR-RX-STEP-REFUSED"]],
  ["ERR-DB-PASSPORT-ENDED", ["ERR-LC-PASSPORT-ENDED", "ERR-RX-STEP-REFUSED"]],
  ["ERR-DB-SUCCESSOR-AUTHORISATION", ["ERR-LC-SUCCESSOR-AUTHORISATION-MISSING", "ERR-RX-STEP-REFUSED"]],
  ["ERR-DB-WASTE-SUCCESSOR", ["ERR-LC-INTERNAL", "ERR-RX-INTERNAL"]],
  ["ERR-DB-LINEAGE", ["ERR-LC-INTERNAL", "ERR-RX-INTERNAL"]],
  ["ERR-DB-RESPONSIBILITY", ["ERR-LC-INTERNAL", "ERR-RX-INTERNAL"]],
  ["ERR-DB-APPEND-ONLY", ["ERR-LC-INTERNAL", "ERR-RX-INTERNAL"]],
  ["ERR-DB-ISOLATION", ["ERR-LC-INTERNAL", "ERR-RX-INTERNAL"]],
]);
const BY_CONSTRAINT = new Map([
  ["23514 passports_end_after_waste_check", ["ERR-LC-STATUS-NOT-ADMITTED", "ERR-RX-STEP-REFUSED"]],
  ["23514 passport_responsibility_intervals_period_check", ["ERR-LC-STATUS-NOT-ADMITTED", "ERR-RX-STEP-REFUSED"]],
  ["23503 passports_battery_model_fkey", ["ERR-LC-MODEL-NOT-FOUND", "ERR-RX-INTERNAL"]],
  ["23514 finite_timestamptz_check", ["ERR-LC-INTERNAL", "ERR-RX-INTERNAL"]],
  ["23514 finite_date_check", ["ERR-LC-INTERNAL", "ERR-RX-INTERNAL"]],
  ["23514 passports_passport_identifier_check", ["ERR-LC-INTERNAL", "ERR-RX-INTERNAL"]],
  ["23505 passports_passport_identifier_key", ["ERR-LC-IDENTIFIER-EXISTS", "ERR-RX-INTERNAL"]],
  ["23505 battery_models_manufacturer_part_key", ["ERR-LC-IDENTIFIER-EXISTS", "ERR-RX-INTERNAL"]],
  ["23505 access_map_versions_model_version_key", ["ERR-LC-ACCESS-MAP-VERSION-EXISTS", "ERR-RX-INTERNAL"]],
  ["23505 issuer_contracts_open_key", ["ERR-LC-CONTRACT-EXISTS", "ERR-RX-INTERNAL"]],
  ["23505 passport_access_records_open_key", ["ERR-LC-RECORD-EXISTS", "ERR-RX-INTERNAL"]],
  ["23505 passport_lineage_links_predecessor_key", ["ERR-LC-IDENTIFIER-RULE", "ERR-RX-INTERNAL"]],
]);
const OTHERWISE = ["ERR-LC-INTERNAL", "ERR-RX-INTERNAL"];
const SQLSTATE_PATTERN = /^[0-9A-Z]{5}$/;
const RAISED_ID_PATTERN = /^(ERR-DB-[A-Z-]+): /;

// Returns true for an error of the database, which carries a SQLSTATE of five characters.
export function isDatabaseError(error) {
  return error !== null && typeof error === "object" && typeof error.code === "string" && SQLSTATE_PATTERN.test(error.code);
}

// Returns the refusal id of a database error by the table of section 9.5. The flag receiving selects
// the column of a receiving endpoint. The function reads the SQLSTATE, the constraint name and, for
// the SQLSTATE P0001 and 22007, the refusal id at the start of the message.
export function refusalIdOfDatabaseError(error, { receiving = false } = {}) {
  const column = receiving ? RECEIVING : OPERATOR;
  if (!isDatabaseError(error)) return OTHERWISE[column];
  if (error.code === "P0001") {
    const raised = RAISED_ID_PATTERN.exec(String(error.message));
    const row = raised ? RAISED.get(raised[1]) : undefined;
    return (row ?? OTHERWISE)[column];
  }
  if (error.code === "22007") return OTHERWISE[column];
  if (error.code === "42501") return receiving ? "ERR-RX-INTERNAL" : "ERR-LC-NOT-DATA-PROVIDER";
  const row = BY_CONSTRAINT.get(`${error.code} ${error.constraint}`);
  return (row ?? OTHERWISE)[column];
}
