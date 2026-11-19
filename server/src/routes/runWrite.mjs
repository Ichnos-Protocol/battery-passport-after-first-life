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

// Requirements: SwR-AUDIT-045 (Dataset write decisions recorded with the authorisation relied on) and
// SwR-DATASET-190 (Passport rows written only under the responsible operator's context), with decision
// D6 (One deployment, one company, one writer), decision D25 (The audit table), decision D50 (Every
// admitted form of an identifier accepted, one form sent) and decision D53 (One clock in UTC). Section
// 9.3 of docs/architecture/implementation_plan.md (the order on every route).
// The helpers of the routes (EL-BACKEND, the HTTP API): the one transaction of a request with its
// audit records, the path parameters, the normalisation of the identifiers of a request and the body
// validation.
import { withTransaction } from "../db/transaction.mjs";
import { Refusal } from "../dataset/refusals.mjs";
import { normaliseUuid } from "../identifiers.mjs";
import { validatorMessages } from "../validation/schemaValidator.mjs";

const UUID_PARAMETER = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
const IDENTITY_PARAMETER = /^[1-9][0-9]{0,15}$/;

// The context of the application that createApp stores in app.locals.context.
export const contextOf = (req) => req.app.locals.context;

function transactionOptions(context) {
  return { actingBpnl: context.config.ownBpnl, today: context.clock.now().toISOString().slice(0, 10) };
}

// Runs the work in one transaction, then records the audit entries of the result after the commit, or
// the audit entries of a thrown refusal after the rollback, and rethrows the refusal. The request has
// released its database client before the audit log takes a client.
export async function runWrite(req, work) {
  const context = contextOf(req);
  let result;
  try {
    result = await withTransaction(context.pool, transactionOptions(context), work);
  } catch (error) {
    if (error instanceof Refusal && error.auditEntries.length > 0) await context.audit.record(error.auditEntries);
    throw error;
  }
  if (Array.isArray(result?.auditEntries) && result.auditEntries.length > 0) await context.audit.record(result.auditEntries);
  return result;
}

// Runs a read in one transaction and writes no audit record.
export function runRead(req, work) {
  const context = contextOf(req);
  return withTransaction(context.pool, transactionOptions(context), work);
}

// A path parameter of a UUID of 36 characters, in upper or lower case, converted to lower case.
export function uuidParameter(req, name) {
  const value = req.params[name];
  if (typeof value !== "string" || !UUID_PARAMETER.test(value)) throw new Refusal("ERR-LC-BODY-INVALID", { messages: [`/${name} is not a UUID of 36 characters`] });
  return value.toLowerCase();
}

// A path parameter of an identity value.
export function identityParameter(req, name) {
  const value = req.params[name];
  if (typeof value !== "string" || !IDENTITY_PARAMETER.test(value)) throw new Refusal("ERR-LC-BODY-INVALID", { messages: [`/${name} is not an identity value`] });
  return Number(value);
}

function isIdentifierName(name) {
  return name === "catenaXId" || name.endsWith("CatenaXId") || name === "messageId";
}

// Returns a copy of a request body of section 10.2 in which every property whose name ends with
// CatenaXId, equals catenaXId or equals messageId holds the normalised form, at every depth. A value
// that is no string is left for the body validation. A value outside the pattern throws the
// IdentifierFormatError, which the error handler answers ERR-LC-BODY-INVALID.
export function normaliseIdentifiers(value) {
  if (Array.isArray(value)) return value.map(normaliseIdentifiers);
  if (value === null || typeof value !== "object") return value;
  const copy = {};
  for (const [key, item] of Object.entries(value)) copy[key] = isIdentifierName(key) && typeof item === "string" ? normaliseUuid(item) : normaliseIdentifiers(item);
  return copy;
}

// Normalises the identifiers of the request body, then validates the body against its schema of
// server/schemas (the order of section 9.3), and returns the normalised body.
export function validatedBody(req, schemaName) {
  const body = normaliseIdentifiers(req.body === undefined ? {} : req.body);
  const outcome = contextOf(req).validator.validateRequest(schemaName, body);
  if (!outcome.valid) throw new Refusal("ERR-LC-BODY-INVALID", { messages: validatorMessages(outcome.errors) });
  return body;
}

// The success body of an operator endpoint.
export function sendData(res, status, data) {
  res.status(status).json({ success: true, data });
}

// The value of the field exposure of several refresh calls: the first failed result, or refreshed true.
export function combinedExposure(results) {
  return results.find((result) => result.refreshed === false) ?? { refreshed: true };
}

// Runs a call of the column "After the commit" of section 9.3 that is no refresh of the exposure, such
// as the withdrawal of an offer. The stored step stands, so a failure is logged at the level error and
// returned as { refreshed: false, cause } and never answered as a refusal (decision D23).
export async function afterCommit(req, fields, work) {
  try {
    await work();
    return { refreshed: true };
  } catch (error) {
    contextOf(req).logger.error("A call after the commit failed.", { traceId: req.traceId ?? null, ...fields, error });
    return { refreshed: false, cause: String(error?.message ?? error) };
  }
}
