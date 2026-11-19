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

// Requirements: SwR-CXCLIENT-111 (End of a recycled battery's passport made known to the provider),
// SwR-CXCLIENT-176 (NewPassportIssued sent to each original passport's data provider under contract),
// SwR-CXCLIENT-178 (PassportEnded sent to the data provider, nameplate manufacturer and successor),
// SwR-CXCLIENT-179 (PassportEnded may be sent to predecessor data providers under contract),
// SwR-CXCLIENT-180 (BatteryRepaired sent to the data provider of the repaired battery's passport),
// SwR-CXCLIENT-181 (BatteryBecameWaste sent to the data provider and the named successor) and
// SwR-CXCLIENT-184 (Notification plan holds one notification per receiver and passport), with decision
// D12 (No notification to the own company) and decision D34 (The passport service provider as a
// receiver) [waits for the owner]. Section 10.3 of docs/architecture/implementation_plan.md.
// The notification plan of a lifecycle event (EL-CXCLIENT, the connector client). Every function of
// the module is pure.

// The receivers of section 10.3 of one event. Each receiver is { bpnl, passportIdentifier }, and a
// receiver of NewPassportIssued also carries the content of its own predecessor link.
export function receiversOf({ operation, request }) {
  switch (operation) {
    case "NewPassportIssued":
      return request.predecessors.map((predecessor) => ({
        bpnl: predecessor.dataProviderBpnl,
        passportIdentifier: predecessor.passportIdentifier,
        content: { predecessorPassportIdentifier: predecessor.passportIdentifier },
      }));
    case "BatteryRepaired":
      return [{ bpnl: request.dataProviderBpnl, passportIdentifier: request.passportIdentifier }];
    case "BatteryBecameWaste":
      return [request.dataProviderBpnl, request.successorBpnl].map((bpnl) => ({ bpnl, passportIdentifier: request.passportIdentifier }));
    case "PassportEnded": {
      const bpnls = [request.dataProviderBpnl, request.nameplateManufacturerBpnl];
      if (request.receivedFromSuccessorBpnl !== undefined && request.receivedFromSuccessorBpnl !== null) bpnls.push(request.receivedFromSuccessorBpnl);
      bpnls.push(...(request.predecessorDataProviderBpnls ?? []));
      return bpnls.map((bpnl) => ({ bpnl, passportIdentifier: request.passportIdentifier }));
    }
    default:
      throw new TypeError("receiversOf needs one of the four operations");
  }
}

// The further receiver of decision D34 [waits for the owner]: the passport service provider of the
// configuration, after the deployment of the data provider has recorded the end of a passport.
export function passportServiceProviderReceivers({ passportServiceProviderBpnl, passportIdentifier }) {
  if (passportServiceProviderBpnl === null || passportServiceProviderBpnl === undefined) return [];
  return [{ bpnl: passportServiceProviderBpnl, passportIdentifier }];
}

// Returns one entry { operation, receiverBpnl, passportIdentifier, content } per pair of receiver
// Business Partner Number and passport identifier, in the order of the receivers, without an entry for
// the own Business Partner Number (decision D12). The content of an entry is the shared content with
// the content of the receiver written over it.
export function buildNotificationPlan({ operation, content, receivers, ownBpnl }) {
  const entries = [];
  const pairs = new Set();
  for (const receiver of receivers) {
    if (receiver.bpnl === ownBpnl) continue;
    const pair = JSON.stringify([receiver.bpnl, receiver.passportIdentifier]);
    if (pairs.has(pair)) continue;
    pairs.add(pair);
    entries.push({
      operation,
      receiverBpnl: receiver.bpnl,
      passportIdentifier: receiver.passportIdentifier,
      content: { ...structuredClone(content), ...structuredClone(receiver.content ?? {}) },
    });
  }
  return entries;
}
