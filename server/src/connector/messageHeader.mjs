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

// Requirement: SwR-CXCLIENT-059 (Notifications built to CX-0151 and sent as JSON POST), with decision
// D50 (Every admitted form of an identifier accepted, one form sent). Sections 9.2.5 and 10.1 of
// docs/architecture/implementation_plan.md.
// The builder of the header of a lifecycle notification (EL-CXCLIENT, the connector client).
import { OPERATIONS } from "../dataset/lifecycleCatalogue.mjs";
import { normaliseUuid } from "../identifiers.mjs";

export const MESSAGE_HEADER_VERSION = "3.0.0";

// Returns the header of section 10.1: a new messageId in the lower-case form with the prefix
// urn:uuid:, the context of the operation, the current time of the clock, the sender, the receiver
// and the version 3.0.0.
export function buildMessageHeader({ operation, senderBpnl, receiverBpnl, clock, newUuid }) {
  if (!Object.hasOwn(OPERATIONS, operation)) throw new TypeError("buildMessageHeader needs one of the four operations");
  return {
    messageId: normaliseUuid(newUuid()),
    context: OPERATIONS[operation].context,
    sentDateTime: clock.now().toISOString(),
    senderBpn: senderBpnl,
    receiverBpn: receiverBpnl,
    version: MESSAGE_HEADER_VERSION,
  };
}
