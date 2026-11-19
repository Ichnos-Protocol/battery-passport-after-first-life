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

// Requirements: PrR-CXD-028 (One conformance test per criterion CX-0160-4-CAC-001 to 016) and
// PrR-CXD-029 (Conformance tests run against the in-process binding and the connector binding), with
// decision D43 (One test code and two bindings), decision D41 (Authentication without an identity
// provider), decision D74 (The binding contract and criterion CAC-012 (notification API)) [waits for the
// owner] and decision D84 (The connector binding on a started deployment) [waits for the owner].
// Section 9.2.9 of docs/architecture/implementation_plan.md.
// The connector binding of the conformance test kit: the three reference servers, their Tractus-X EDC
// 0.13.0 connectors and their Digital Twin Registries of a deployment of tck/docker-compose.yml that
// "docker compose up -d --wait" has started. The binding runs no docker command, restarts no server and
// empties no table: each test file works on identifiers of its own.
import { signOperatorToken } from "../../server/src/access/operatorToken.mjs";
import { createEdcOfferStore } from "../../server/src/connector/edcOfferStore.mjs";
import { TransportStep, createEdcTransferClient } from "../../server/src/connector/edcTransport.mjs";
import { NOTIFICATION_ASSET_ID, admits, buildNotificationAssetOffer } from "../../server/src/connector/policyBuilder.mjs";
import { createDtrTwinRegistry } from "../../server/src/twins/dtrTwinRegistry.mjs";

// The three participants of section 9.2.9 and the services of tck/docker-compose.yml.
const PARTICIPANTS = Object.freeze([
  { role: "provider", bpnl: "BPNL00000000TCK1", number: 1 },
  { role: "operator", bpnl: "BPNL00000000TCK2", number: 2 },
  { role: "recycler", bpnl: "BPNL00000000TCK3", number: 3 },
]);
const DATA_PLANE_KEY_HEADER = "x-api-key";
const PARTNER_BPN_HEADER = "edc-bpn";
const OUTBOX_INTERVAL_MILLISECONDS = 1000;
const SETTLE_POLLS = 60;

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function request(base, method, path, body, headers) {
  const init = { method, headers: { ...headers } };
  if (body !== undefined) {
    init.headers["content-type"] = "application/json";
    init.body = JSON.stringify(body);
  }
  const response = await fetch(`${base}${path}`, init);
  const text = await response.text();
  let parsed = null;
  try {
    parsed = text.length === 0 ? null : JSON.parse(text);
  } catch {
    parsed = text;
  }
  return { status: response.status, body: parsed };
}

// The offer whose path names the requested path: the path itself, or the path with a further suffix such
// as /submodel, which the data plane appends (section 10.5).
function offerOfPath(offers, path) {
  return offers.filter((offer) => path === offer.path || path.startsWith(`${offer.path}/`)).sort((left, right) => right.path.length - left.path.length)[0];
}

// The passport identifiers that a request body and the field data of its answer name (decision D86, A
// test file waits only for its own notifications): passportIdentifier and predecessors[].passportIdentifier
// of the body, passport.passportIdentifier and notifications[].passportIdentifier of data.
function passportIdentifiersOf(body, answer) {
  const identifiers = [];
  if (body !== null && typeof body === "object") {
    if (typeof body.passportIdentifier === "string") identifiers.push(body.passportIdentifier);
    for (const predecessor of Array.isArray(body.predecessors) ? body.predecessors : []) {
      if (typeof predecessor?.passportIdentifier === "string") identifiers.push(predecessor.passportIdentifier);
    }
  }
  const data = answer?.body?.data;
  if (typeof data?.passport?.passportIdentifier === "string") identifiers.push(data.passport.passportIdentifier);
  for (const notification of Array.isArray(data?.notifications) ? data.notifications : []) {
    if (typeof notification?.passportIdentifier === "string") identifiers.push(notification.passportIdentifier);
  }
  return identifiers;
}

// A sent record is settled when it is not pending, or when the sender has made its attempt and plans the
// retry of D49 [waits for the owner] after the time of the poll.
const settled = (record, pollTime) => record.outcome !== "pending" || (record.attempts >= 1 && new Date(record.notBefore).getTime() > pollTime);

const unavailable = (participant, service, cause) => new Error(`connector binding not available: ${participant} ${service}: ${cause}`);

// Returns the binding object of section 9.2.9 on the started deployment. The argument deployment holds
// the seven variables of the deployment that tck/lib/binding.mjs reads.
export async function startConnectorBinding({ accessRegime = "after-act", passportServiceProviderBpnl } = {}, deployment = {}) {
  if ((deployment.accessRegime ?? "after-act") !== accessRegime) {
    throw unavailable("deployment", "regime", `the test file needs ACCESS_REGIME=${accessRegime}, and the deployment runs ${deployment.accessRegime ?? "after-act"}`);
  }
  if ((deployment.passportServiceProviderBpnl ?? null) !== (passportServiceProviderBpnl ?? null)) {
    throw unavailable("deployment", "regime", `the test file needs PASSPORT_SERVICE_PROVIDER_BPNL=${passportServiceProviderBpnl ?? "(none)"}, and the deployment runs ${deployment.passportServiceProviderBpnl ?? "(none)"}`);
  }
  const instances = PARTICIPANTS.map(({ role, bpnl, number }) => {
    const server = `http://server-${number}:8080`;
    const dataPlaneKey = deployment[`dataPlaneKey${number}`];
    const management = {
      edcManagementUrl: `http://cp-${number}:8081/management`,
      edcManagementApiKey: deployment.managementApiKey,
      edcManagementApiKeyHeader: "x-api-key",
      publicBaseUrl: server,
      dataPlaneKey,
      dataPlaneKeyHeader: DATA_PLANE_KEY_HEADER,
    };
    return {
      role,
      bpnl,
      server,
      dataPlaneKey,
      dspUrl: `http://cp-${number}:8084/api/v1/dsp/2025-1`,
      offerStore: createEdcOfferStore({ config: management, fetch }),
      transfers: createEdcTransferClient({ config: management, fetch }),
      twinRegistry: createDtrTwinRegistry({ config: { dtrUrl: `http://dtr-${number}:4243/api/v3`, ownBpnl: bpnl }, fetch }),
    };
  });

  // The start checks of section 9.2.9.
  for (const instance of instances) {
    let health;
    try {
      health = await request(instance.server, "GET", "/health");
    } catch (error) {
      throw unavailable(instance.role, "server", error.message);
    }
    if (health.status !== 200 || health.body?.status !== "up") throw unavailable(instance.role, "server", `GET /health answered ${health.status}`);
    let offers;
    try {
      offers = await instance.offerStore.list();
    } catch (error) {
      throw unavailable(instance.role, "connector", error.message);
    }
    if (!offers.some((offer) => offer.assetId === NOTIFICATION_ASSET_ID)) throw unavailable(instance.role, "connector", "the notification asset is not listed");
  }

  const byBpnl = new Map(instances.map((instance) => [instance.bpnl, instance]));
  // The passports of the test file (D86).
  const registered = new Set();
  // A reader is a participant of the binding, a Business Partner Number of a participant, or a Business
  // Partner Number without a deployment.
  const readerOf = (reader) => {
    const bpnl = typeof reader === "string" ? reader : reader.bpnl;
    return { bpnl, instance: byBpnl.get(bpnl) ?? null };
  };

  // The offers of the participant that the catalog of the reader's connector lists.
  async function catalogueOf(instance, reader) {
    const { bpnl, instance: readerInstance } = readerOf(reader);
    const offers = await instance.offerStore.list();
    if (readerInstance === null) return offers.filter((offer) => admits(offer, bpnl));
    const listed = new Set((await readerInstance.transfers.catalog(instance.dspUrl, instance.bpnl)).map(({ dataset }) => dataset["@id"]));
    return offers.filter((offer) => listed.has(offer.assetId));
  }

  // The endpoint data reference of an asset of the participant for a reader with a connector.
  async function referenceOf(instance, readerInstance, assetId) {
    const [entry] = await readerInstance.transfers.catalog(instance.dspUrl, instance.bpnl, assetId);
    if (entry === undefined) throw new TransportStep("no_asset", `the catalog of ${instance.role} lists no asset ${assetId} for ${readerInstance.role}`);
    return readerInstance.transfers.open(instance.dspUrl, entry);
  }

  function participantOf(instance) {
    const token = () => signOperatorToken({ sub: "tck-operator", bpnl: instance.bpnl, expiresInSeconds: 3600 }, { secret: deployment.operatorTokenSecret, now: new Date() });
    return Object.freeze({
      bpnl: instance.bpnl,
      call: async (method, path, body) => {
        const answer = await request(instance.server, method, path, body, { authorization: `Bearer ${token()}` });
        for (const identifier of passportIdentifiersOf(body, answer)) registered.add(identifier);
        return answer;
      },
      asPartner: (reader) =>
        Object.freeze({
          async get(path) {
            const offer = offerOfPath(await instance.offerStore.list(), path);
            if (offer === undefined) return { outcome: "no_asset", status: null, body: null };
            const { bpnl, instance: readerInstance } = readerOf(reader);
            if (!admits(offer, bpnl)) return { outcome: "contract_refused", status: null, body: null };
            let answer;
            if (readerInstance === null) {
              // A reader without a deployment has no connector and reads through the server (D84).
              answer = await request(instance.server, "GET", path, undefined, { [DATA_PLANE_KEY_HEADER]: instance.dataPlaneKey, [PARTNER_BPN_HEADER]: bpnl });
            } else {
              let reference;
              try {
                reference = await referenceOf(instance, readerInstance, offer.assetId);
              } catch (error) {
                if (error instanceof TransportStep) return { outcome: error.outcome, status: null, body: null };
                throw error;
              }
              answer = await readerInstance.transfers.call(reference, "GET", path.slice(offer.path.length), undefined);
            }
            const outcome = answer.status === 200 ? "received" : answer.status >= 500 ? "transport_failed" : "provider_refused";
            return { outcome, status: answer.status, body: answer.body };
          },
        }),
      // D91: a read of the participant's server itself as the partner reader, without the offer and
      // without the data plane, with the two headers of D41.
      atServer: (reader) =>
        Object.freeze({
          get: (path) => request(instance.server, "GET", path, undefined, { [DATA_PLANE_KEY_HEADER]: instance.dataPlaneKey, [PARTNER_BPN_HEADER]: readerOf(reader).bpnl }),
        }),
      catalogue: (reader) => catalogueOf(instance, reader),
      registry: Object.freeze({ put: (shell) => instance.twinRegistry.put(shell), read: (shellId) => instance.twinRegistry.read(shellId) }),
      // D74 [waits for the owner]: the notification asset through the participant's connector offer store.
      withdrawNotificationAsset: () => instance.offerStore.withdraw(NOTIFICATION_ASSET_ID),
      publishNotificationAsset: () => instance.offerStore.publish(buildNotificationAssetOffer({ allowedBpnls: null })),
      // The endpoint data reference of an asset of the participant `provider` for this participant, for
      // the header test of tck/connectorHeader.test.mjs; the sixteen test files do not use it.
      openTransfer: (provider, assetId) => referenceOf(byBpnl.get(provider.bpnl), instance, assetId),
      callDataPlane: (reference, method, suffix, body, headers) => instance.transfers.call(reference, method, suffix, body, headers),
    });
  }

  const participants = instances.map(participantOf);
  const [provider, operator, recycler] = participants;
  return Object.freeze({
    provider,
    operator,
    recycler,
    // Polls the sent records of the three servers once per second until every sent record of the
    // passports of the test file is settled, at most 60 times, and then waits twice the pause of the
    // workers, so that a pending pull has run (D86).
    async settle() {
      let pending = [];
      for (let poll = 0; poll < SETTLE_POLLS; poll += 1) {
        pending = [];
        for (const [index, participant] of participants.entries()) {
          const answer = await participant.call("GET", "/api/notifications/sent");
          const pollTime = Date.now();
          for (const record of answer.body?.data?.notifications ?? []) {
            if (registered.has(record.passportIdentifier) && !settled(record, pollTime)) pending.push([instances[index].role, record.messageId]);
          }
        }
        if (pending.length === 0) break;
        await sleep(1000);
      }
      if (pending.length > 0) throw new Error(`settle: ${pending[0][0]} holds the pending notification ${pending[0][1]}`);
      await sleep(2 * OUTBOX_INTERVAL_MILLISECONDS);
    },
    // The data of the test file stays in the deployment; "docker compose down -v" removes it (section 15
    // item 7).
    stop: async () => {},
  });
}
