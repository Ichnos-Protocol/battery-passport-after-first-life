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

// Requirement: SwR-BACKEND-148 (Notification answered 200 when accepted, 4xx or 5xx otherwise). Section
// 9.3 of docs/architecture/implementation_plan.md (EP-HEALTH).
// The health endpoint EP-HEALTH outside /api (EL-BACKEND, the HTTP API), without a subject.
import express from "express";

import { checkHealth } from "../db/health.mjs";

// Returns the router of GET /health: 200 { "status": "up" } when the database answers, and 503
// { "status": "down" } otherwise.
export function createHealthRoutes({ pool }) {
  const router = express.Router();
  router.get("/health", async (req, res) => {
    if (await checkHealth(pool)) res.status(200).json({ status: "up" });
    else res.status(503).json({ status: "down" });
  });
  return router;
}
