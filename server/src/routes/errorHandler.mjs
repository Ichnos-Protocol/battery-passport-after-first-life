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
// envelope). Sections 9.3 and 9.5 of docs/architecture/implementation_plan.md.
// The one error handler of the application (EL-BACKEND, the HTTP API): every error becomes a refusal
// of section 9.5 with the error body of ErrorResponse.schema.json. No message of the database and no
// answer of the body parser reaches a response.
import { REFUSALS, Refusal, isDatabaseError, refusalBody, refusalIdOfDatabaseError } from "../dataset/refusals.mjs";
import { IdentifierFormatError } from "../identifiers.mjs";

const RECEIVING_PREFIX = "/api/lifecycle-notifications";

// True for a request of a receiving endpoint.
export function isReceivingRequest(req) {
  return req.originalUrl === RECEIVING_PREFIX || req.originalUrl.startsWith(`${RECEIVING_PREFIX}/`) || req.originalUrl.startsWith(`${RECEIVING_PREFIX}?`);
}

function refusalOf(error, receiving) {
  if (error instanceof Refusal) return error;
  if (error?.type === "entity.parse.failed" || error?.type === "content.invalid") return new Refusal(receiving ? "ERR-RX-CONTENT-INVALID" : "ERR-LC-BODY-INVALID");
  if (error?.type === "entity.too.large") return new Refusal(receiving ? "ERR-RX-BODY-TOO-LARGE" : "ERR-LC-BODY-TOO-LARGE");
  if (error instanceof IdentifierFormatError) {
    return receiving ? new Refusal("ERR-RX-INTERNAL") : new Refusal("ERR-LC-BODY-INVALID", { messages: [error.message] });
  }
  if (isDatabaseError(error)) return new Refusal(refusalIdOfDatabaseError(error, { receiving }));
  return new Refusal(receiving ? "ERR-RX-INTERNAL" : "ERR-LC-INTERNAL");
}

// Returns the Express error middleware.
export function createErrorHandler({ logger }) {
  // Express recognises an error middleware by its four parameters.
  return function errorHandler(error, req, res, next) {
    const receiving = isReceivingRequest(req);
    const refusal = refusalOf(error, receiving);
    const fields = { traceId: req.traceId ?? null, route: `${req.method} ${req.originalUrl.split("?")[0]}`, actingBpnl: req.app.locals.context?.config.ownBpnl ?? null };
    if (isDatabaseError(error)) {
      logger.error("A database error refused the request.", { ...fields, sqlState: error.code, constraint: error.constraint ?? null, refusalId: refusal.id });
    } else if (!(error instanceof Refusal) && REFUSALS[refusal.id].status >= 500) {
      logger.error("The request failed.", { ...fields, refusalId: refusal.id, error });
    }
    if (res.headersSent) {
      res.end();
      return;
    }
    res.status(refusal.status).json(refusalBody(refusal));
  };
}
