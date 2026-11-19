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

// Requirements: SwR-CXCLIENT-166 (Point 4 offer for the passport issuer gated by a recorded contract)
// and SwR-CXCLIENT-177 (Second-life battery's point 4 offer to the original data provider), with
// decision D38 (The sharing of individual battery information). System requirement SyR-PASS-215
// (Individual battery information shared with the passport issuer under contract). Section 9.2.5 of
// docs/architecture/implementation_plan.md.
// The contracts of the sharing of individual battery information with the original issuer
// (EL-CXCLIENT, the connector client). The received information is never written into a passport or
// into a payload of a passport.
import { Refusal } from "../dataset/refusals.mjs";
import { validatorMessages } from "../validation/schemaValidator.mjs";

// The record of a contract in an answer of the operator endpoints. The record holds no payload.
export function issuerContractOf(row) {
  return {
    id: row.id,
    side: row.side,
    passportIdentifier: row.passport_identifier,
    batteryIdentifier: row.battery_identifier,
    passportId: row.passport_id,
    issuerBpnl: row.issuer_bpnl,
    providerBpnl: row.provider_bpnl,
    pullState: row.pull_state,
    pullCause: row.pull_cause,
    validFrom: row.valid_from.toISOString(),
    validTo: row.valid_to === null ? null : row.valid_to.toISOString(),
  };
}

// Returns the issuer contract service of a deployment.
export function createIssuerContractService({ repository, passportRepository, validator, clock, ownBpnl }) {
  async function refuseExisting(client, key) {
    if ((await repository.findUnendedIssuerContract(client, key)) !== null) throw new Refusal("ERR-LC-CONTRACT-EXISTS");
  }

  // The contract of the deployment that offers the information. For a passport of the own company the
  // issuer is the data provider of a predecessor and the payload is the stored product condition; for
  // another passport the deployment acts for the purchaser and the request supplies the payload.
  async function recordProviderContract({ client, data }) {
    const passport = await passportRepository.findPassportByIdentifierForUpdate(client, data.passportIdentifier);
    const hasPayload = data.productCondition !== undefined && data.productCondition !== null;
    const key = { side: "provider", passportIdentifier: data.passportIdentifier, issuerBpnl: data.issuerBpnl, providerBpnl: ownBpnl };
    if (passport !== null) {
      const links = await passportRepository.listLineageLinks(client, passport.id);
      if (hasPayload || !links.some((link) => link.predecessor_data_provider_bpnl === data.issuerBpnl)) throw new Refusal("ERR-LC-ISSUER-NOT-LINKED");
      if ((await passportRepository.findAspectPayload(client, passport.id, "product-condition")) === null) throw new Refusal("ERR-LC-SUBMODEL-NOT-FOUND");
      await refuseExisting(client, key);
      const row = await repository.insertIssuerContract(client, {
        ...key,
        passportId: passport.id,
        batteryIdentifier: passport.battery_identifier,
        validFrom: clock.now(),
      });
      return { contract: issuerContractOf(row) };
    }
    if (!hasPayload) throw new Refusal("ERR-LC-ISSUER-NOT-LINKED");
    const validation = validator.validateAspect("product-condition", data.productCondition);
    if (!validation.valid) throw new Refusal("ERR-LC-BODY-INVALID", { messages: validatorMessages(validation.errors) });
    await refuseExisting(client, key);
    const row = await repository.insertIssuerContract(client, { ...key, productCondition: data.productCondition, validFrom: clock.now() });
    return { contract: issuerContractOf(row) };
  }

  // The contract of the deployment of the original issuer, with the pull state pending.
  async function recordIssuerContract({ client, data }) {
    const key = { side: "issuer", passportIdentifier: data.passportIdentifier, issuerBpnl: ownBpnl, providerBpnl: data.providerBpnl };
    await refuseExisting(client, key);
    const row = await repository.insertIssuerContract(client, { ...key, batteryIdentifier: data.batteryIdentifier, pullState: "pending", validFrom: clock.now() });
    return { contract: issuerContractOf(row) };
  }

  async function endContract({ client, contractId }) {
    const contract = await repository.findIssuerContract(client, contractId);
    if (contract === null) throw new Refusal("ERR-LC-CONTRACT-NOT-FOUND");
    if (contract.valid_to !== null) throw new Refusal("ERR-LC-CONTRACT-ENDED");
    return { contract: issuerContractOf(await repository.endIssuerContract(client, contractId, clock.now())) };
  }

  // The payload of an open provider contract, served to the partner whose Business Partner Number is
  // the issuer of the contract.
  async function readBatteryInformation({ client, subject, contractId }) {
    const contract = await repository.findIssuerContract(client, contractId);
    if (contract === null || contract.side !== "provider") throw new Refusal("ERR-LC-CONTRACT-NOT-FOUND");
    if (subject?.kind !== "partner" || subject.bpnl !== contract.issuer_bpnl) throw new Refusal("ERR-AC-ACCESS-GROUP-REFUSED");
    if (contract.valid_to !== null) throw new Refusal("ERR-LC-CONTRACT-ENDED");
    if (contract.product_condition !== null) return contract.product_condition;
    const stored = await passportRepository.findAspectPayload(client, contract.passport_id, "product-condition");
    if (stored === null) throw new Refusal("ERR-LC-SUBMODEL-NOT-FOUND");
    return stored.payload;
  }

  // EP-CONTRACT-PULL: sets an open issuer contract back to the pull state pending, so that the worker pulls.
  async function requestPull({ client, contractId }) {
    const contract = await repository.findIssuerContractForUpdate(client, contractId);
    if (contract === null || contract.side !== "issuer") throw new Refusal("ERR-LC-CONTRACT-NOT-FOUND");
    if (contract.valid_to !== null) throw new Refusal("ERR-LC-CONTRACT-ENDED");
    return { contract: issuerContractOf(await repository.setPullState(client, contractId, { pullState: "pending", pullCause: null })) };
  }

  // EP-RECEIVED-INFORMATION: the issuer contract and the list of its received records.
  async function readReceivedInformation({ client, contractId }) {
    const contract = await repository.findIssuerContract(client, contractId);
    if (contract === null || contract.side !== "issuer") throw new Refusal("ERR-LC-CONTRACT-NOT-FOUND");
    const received = (await repository.listReceivedBatteryInformation(client, contractId)).map((row) => ({
      id: row.id,
      passportIdentifier: row.passport_identifier,
      batteryIdentifier: row.battery_identifier,
      agreementId: row.agreement_id,
      receivedAt: row.received_at.toISOString(),
      payload: row.payload,
    }));
    return { contract: issuerContractOf(contract), received };
  }

  return Object.freeze({ recordProviderContract, recordIssuerContract, endContract, readBatteryInformation, requestPull, readReceivedInformation });
}
