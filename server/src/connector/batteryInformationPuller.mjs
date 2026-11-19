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

// Requirements: SwR-CXCLIENT-167 (Issuer's negotiation for point 4 information run without a user step)
// and SwR-CXCLIENT-168 (Point 4 transfer to the issuer stored without a user step), with decision D38
// (The sharing of individual battery information). System requirements SyR-CXD-218 (Issuer's contract
// negotiation for individual battery information without a manual step) and SyR-CXD-219 (Transfer of
// individual battery information to the issuer without a manual step). Section 9.2.5 of
// docs/architecture/implementation_plan.md.
// The puller of the individual battery information on the deployment of the original issuer
// (EL-CXCLIENT, the connector client). The puller writes no passport and no payload of a passport.
import { withTransaction } from "../db/transaction.mjs";
import { ASPECTS } from "../submodels/submodelService.mjs";
import { validatorMessages } from "../validation/schemaValidator.mjs";

const PRODUCT_CONDITION = ASPECTS["product-condition"];

// Returns the puller. The function pullDue repeats one unit of work until no contract qualifies. A
// thrown error of the receiver resolver or of the transport is recorded as transport_failed.
export function createBatteryInformationPuller({ pool, repository, transport, receiverResolver, validator, clock, ownBpnl }) {
  const options = () => ({ actingBpnl: ownBpnl, today: clock.now().toISOString().slice(0, 10) });

  async function attempt(contract) {
    let resolved;
    try {
      resolved = await receiverResolver.resolve(contract.provider_bpnl);
    } catch (error) {
      return { outcome: "transport_failed", cause: `provider resolution failed: ${error.message}` };
    }
    if (resolved === null) return { outcome: "receiver_unresolved", cause: `no connector resolved for ${contract.provider_bpnl}` };
    try {
      return await transport.pull({
        providerBpnl: contract.provider_bpnl,
        connectorUrl: resolved.connectorUrl,
        semanticId: PRODUCT_CONDITION.semanticId,
        passportIdentifier: contract.passport_identifier,
      });
    } catch (error) {
      return { outcome: "transport_failed", cause: error.message };
    }
  }

  async function pullOne() {
    return withTransaction(pool, options(), async (client) => {
      const contract = await repository.claimPendingIssuerContract(client);
      if (contract === null) return false;
      const result = await attempt(contract);
      if (result.outcome !== "received") {
        await repository.setPullState(client, contract.id, { pullState: result.outcome, pullCause: result.cause ?? null });
        return true;
      }
      const validation = validator.validateAspect("product-condition", result.body);
      if (!validation.valid) {
        await repository.setPullState(client, contract.id, {
          pullState: "provider_refused",
          pullCause: `the received body fails the stored schema of product-condition: ${validatorMessages(validation.errors).join("; ")}`,
        });
        return true;
      }
      await repository.insertReceivedBatteryInformation(client, {
        contractId: contract.id,
        passportIdentifier: contract.passport_identifier,
        batteryIdentifier: contract.battery_identifier,
        agreementId: result.agreementId,
        payload: result.body,
        receivedAt: clock.now(),
      });
      await repository.setPullState(client, contract.id, { pullState: "received", pullCause: null });
      return true;
    });
  }

  async function pullDue() {
    let pulled = 0;
    while (await pullOne()) pulled += 1;
    return pulled;
  }

  return Object.freeze({ pullDue });
}
