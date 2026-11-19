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
// provider), decision D11 (The receiver resolution behind a port) and decision D74 (The binding contract
// and criterion CAC-012 (notification API)) [waits for the owner]. Section 9.2.9 of
// docs/architecture/implementation_plan.md.
// The in-process binding of the conformance test kit: three applications of the reference server, for
// the data provider, the second-life operator and the recycler, each with its own database schema, on one
// memory network of shared maps.
import { readFileSync } from "node:fs";
import { basename } from "node:path";

import { signOperatorToken } from "../../server/src/access/operatorToken.mjs";
import { createApp } from "../../server/src/app.mjs";
import { loadConfig } from "../../server/src/config.mjs";
import { createMemoryOfferStore } from "../../server/src/connector/memoryOfferStore.mjs";
import { createMemoryReceiverResolver } from "../../server/src/connector/memoryReceiverResolver.mjs";
import { createMemoryTransport } from "../../server/src/connector/memoryTransport.mjs";
import { NOTIFICATION_ASSET_ID } from "../../server/src/connector/policyBuilder.mjs";
import { upsertOwnCompany } from "../../server/src/dataset/companyRepository.mjs";
import { createLogger } from "../../server/src/logger.mjs";
import { createMemoryTwinRegistry } from "../../server/src/twins/memoryTwinRegistry.mjs";
import { appConnectionString, createTestDatabase } from "../../server/test/support/database.mjs";

// The three participants of section 9.2.9 and the test data of section 10.7.
const PARTICIPANTS = Object.freeze([
  { role: "provider", bpnl: "BPNL00000000TCK1" },
  { role: "operator", bpnl: "BPNL00000000TCK2" },
  { role: "recycler", bpnl: "BPNL00000000TCK3" },
]);
const DATA_PLANE_KEY = "tck-data-plane-key-0123456789abcdefghij";
const DATA_PLANE_KEY_HEADER = "x-api-key";
const PARTNER_BPN_HEADER = "edc-bpn";
const TOKEN_SECRET = "tck-operator-token-secret-0123456789abcdef";
const START = "2026-06-15T10:00:00.000Z";
const SETTLE_SECONDS = 6;
const ADDRESS = JSON.parse(readFileSync(new URL("../../server/test/fixtures/nameplate.json", import.meta.url), "utf8")).AddressInformation;

// The number of the criterion of the running test file, for example "001" for tck/CAC-001.tck.mjs.
function criterionNumber() {
  const match = /^CAC-(\d{3})\.tck\.mjs$/.exec(basename(process.argv[1] ?? ""));
  if (match === null) throw new Error("The in-process binding runs inside a test file tck/CAC-<nnn>.tck.mjs.");
  return match[1];
}

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

const bpnlOf = (reader) => (typeof reader === "string" ? reader : reader.bpnl);
const admits = (offer, bpnl) => offer.allowedBpnls === null || offer.allowedBpnls.includes(bpnl);

// The offer whose path names the requested path: the path itself, or the path with a further suffix such
// as /submodel, which the data plane appends (section 10.5).
function offerOfPath(offers, path) {
  return offers.filter((offer) => path === offer.path || path.startsWith(`${offer.path}/`)).sort((left, right) => right.path.length - left.path.length)[0];
}

// Returns the binding object of section 9.2.9.
export async function startInProcessBinding({ accessRegime = "after-act", passportServiceProviderBpnl } = {}) {
  const number = criterionNumber();
  let current = new Date(START);
  const clock = { now: () => new Date(current.getTime()) };
  const network = { participants: new Map(), offerStores: new Map(), didByBpnl: new Map(), connectorUrlByDid: new Map() };
  const resolver = createMemoryReceiverResolver({ didByBpnl: network.didByBpnl, connectorUrlByDid: network.connectorUrlByDid });
  const instances = [];

  try {
    for (const { role, bpnl } of PARTICIPANTS) {
      const db = await createTestDatabase(`tck${number}_${role}`);
      const instance = { db };
      instances.push(instance);
      const variables = {
        OWN_BPNL: bpnl,
        OWN_LEGAL_NAME: `Example Company ${bpnl.slice(-4)}`,
        OWN_ADDRESS: JSON.stringify(ADDRESS),
        DATABASE_URL: appConnectionString(),
        DATABASE_SCHEMA: db.schema,
        PUBLIC_BASE_URL: `http://${bpnl.toLowerCase()}.memory.invalid`,
        BINDING: "memory",
        OPERATOR_TOKEN_SECRET: TOKEN_SECRET,
        DATA_PLANE_KEY,
        DATA_PLANE_KEY_HEADER,
        PARTNER_BPN_HEADER,
        ACCESS_REGIME: accessRegime,
        LOG_LEVEL: "error",
      };
      if (passportServiceProviderBpnl !== undefined) variables.PASSPORT_SERVICE_PROVIDER_BPNL = passportServiceProviderBpnl;
      const config = loadConfig(variables);
      await upsertOwnCompany(db.appPool, config);
      const offerStore = createMemoryOfferStore();
      const twinRegistry = createMemoryTwinRegistry();
      const transport = createMemoryTransport({ participants: network.participants, offerStores: network.offerStores, ownBpnl: bpnl });
      const lines = [];
      const logger = createLogger({ level: "error", stream: { write: (text) => lines.push(text) }, clock });
      const { app, worker } = createApp({ config, pool: db.appPool, clock, transport, offerStore, twinRegistry, receiverResolver: resolver, logger });
      const { offerPublisher } = app.locals.context;
      Object.assign(instance, { role, bpnl, config, offerStore, offerPublisher, twinRegistry, transport, worker, lines });
      await offerPublisher.publishNotificationAsset();
      const did = `did:web:${bpnl.toLowerCase()}.memory.invalid`;
      network.participants.set(config.publicBaseUrl, { bpnl, app, dataPlaneKey: DATA_PLANE_KEY, dataPlaneKeyHeader: DATA_PLANE_KEY_HEADER, partnerBpnHeader: PARTNER_BPN_HEADER });
      network.offerStores.set(bpnl, offerStore);
      network.didByBpnl.set(bpnl, did);
      network.connectorUrlByDid.set(did, config.publicBaseUrl);
      instance.server = await new Promise((resolve, reject) => {
        const server = app.listen(0, "127.0.0.1");
        server.once("listening", () => resolve(server));
        server.once("error", reject);
      });
      instance.base = `http://127.0.0.1:${instance.server.address().port}`;
    }
  } catch (error) {
    await stopInstances(instances);
    throw error;
  }

  function participantOf(instance) {
    const token = () => signOperatorToken({ sub: "tck-operator", bpnl: instance.bpnl, expiresInSeconds: 3600 }, { secret: TOKEN_SECRET, now: clock.now() });
    return Object.freeze({
      bpnl: instance.bpnl,
      call: (method, path, body) => request(instance.base, method, path, body, { authorization: `Bearer ${token()}` }),
      // A read of the participant reader through the data plane: the offer of the path must admit the
      // reader, as the contract negotiation of the connector requires, and the request then carries the
      // data plane key and the Business Partner Number of the reader in the two headers of D41.
      asPartner: (reader) =>
        Object.freeze({
          async get(path) {
            const offer = offerOfPath(await instance.offerStore.list(), path);
            if (offer === undefined) return { outcome: "no_asset", status: null, body: null };
            if (!admits(offer, bpnlOf(reader))) return { outcome: "contract_refused", status: null, body: null };
            const answer = await request(instance.base, "GET", path, undefined, { [DATA_PLANE_KEY_HEADER]: DATA_PLANE_KEY, [PARTNER_BPN_HEADER]: bpnlOf(reader) });
            const outcome = answer.status === 200 ? "received" : answer.status >= 500 ? "transport_failed" : "provider_refused";
            return { outcome, status: answer.status, body: answer.body };
          },
        }),
      catalogue: async (reader) => (await instance.offerStore.list()).filter((offer) => admits(offer, bpnlOf(reader))),
      registry: Object.freeze({ put: (shell) => instance.twinRegistry.put(shell), read: (shellId) => instance.twinRegistry.read(shellId) }),
      // The withdrawal and the publication of the notification asset of the participant through its offer
      // store (D74 [waits for the owner]), so that criterion CAC-012 tests a receiver without an asset.
      withdrawNotificationAsset: () => instance.offerStore.withdraw(NOTIFICATION_ASSET_ID),
      publishNotificationAsset: async () => {
        await instance.offerPublisher.publishNotificationAsset();
      },
    });
  }

  const [provider, operator, recycler] = instances.map(participantOf);
  return Object.freeze({
    provider,
    operator,
    recycler,
    // Advances the clock by 6 seconds and runs the worker of the three instances twice.
    async settle() {
      current = new Date(current.getTime() + SETTLE_SECONDS * 1000);
      for (let round = 0; round < 2; round += 1) {
        for (const instance of instances) await instance.worker.tick();
      }
    },
    stop: () => stopInstances(instances),
  });
}

async function stopInstances(instances) {
  for (const instance of instances) {
    if (instance.worker) await instance.worker.stop();
    if (instance.transport) await instance.transport.close();
    if (instance.server) {
      await new Promise((resolve) => {
        instance.server.close(resolve);
        instance.server.closeAllConnections();
      });
    }
    await instance.db.drop();
  }
}
