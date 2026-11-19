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

// Requirements: SwR-CXCLIENT-183 (Sender's record of a receiver without an asset or a contract) and
// SwR-BGWORK-010 (Lifecycle notifications sent unchanged as JSON POST through the connector), with
// decision D49 (The retry of a failed transport) [waits for the owner]. Section 9.3 of
// docs/architecture/implementation_plan.md.
// The operator endpoints EP-NOTIFICATIONS-SENT, EP-NOTIFICATIONS-RECEIVED and EP-NOTIFICATION-RETRY
// (EL-BACKEND, the HTTP API).
import express from "express";

import { authenticate } from "../access/authenticate.mjs";
import { requireCapability } from "../access/requireCapability.mjs";
import { contextOf, identityParameter, runRead, runWrite, sendData } from "./runWrite.mjs";

// Returns the router of the three endpoints, mounted at /api/notifications.
export function createNotificationRecordRoutes({ config, clock }) {
  const router = express.Router();
  const authenticated = authenticate({ config, clock });

  router.get("/sent", authenticated, requireCapability("notification.read"), async (req, res) => {
    sendData(res, 200, { notifications: await runRead(req, (client) => contextOf(req).sender.listSent({ client })) });
  });

  router.get("/received", authenticated, requireCapability("notification.read"), async (req, res) => {
    sendData(res, 200, { notifications: await runRead(req, (client) => contextOf(req).lifecycle.listReceivedNotifications({ client })) });
  });

  router.post("/sent/:id/retry", authenticated, requireCapability("lifecycle.report"), async (req, res) => {
    const id = identityParameter(req, "id");
    const result = await runWrite(req, (client) => contextOf(req).sender.retry({ client, id }));
    sendData(res, 200, result);
  });

  return router;
}
