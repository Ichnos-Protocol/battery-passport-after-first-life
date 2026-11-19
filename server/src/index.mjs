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

// Requirements: SwR-DATASET-190 (Passport rows written only under the responsible operator's context)
// and SwR-DATASET-200 (Passport rows written only in the data provider's deployment), with decision D6
// (One deployment, one company, one writer), decision D24 (Two database roles and row-level security)
// and decision D60 (A fixed search path for every function, no temporary table for the application
// role, and a database of its own). Section 9.2.1 of docs/architecture/implementation_plan.md.
// The one composition root of the reference server (EL-BACKEND, the HTTP API) and the command
// "npm start": the only module of the server that reads process.env. The two statements of the start
// checks are read statements of the catalogue that section 9.2.1 assigns to this module.
import { randomUUID } from "node:crypto";

import { createApp } from "./app.mjs";
import { loadConfig } from "./config.mjs";
import { createMemoryOfferStore } from "./connector/memoryOfferStore.mjs";
import { createMemoryReceiverResolver } from "./connector/memoryReceiverResolver.mjs";
import { createMemoryTransport } from "./connector/memoryTransport.mjs";
import { upsertOwnCompany } from "./dataset/companyRepository.mjs";
import { createPool } from "./db/pool.mjs";
import { createLogger } from "./logger.mjs";
import { createMemoryTwinRegistry } from "./twins/memoryTwinRegistry.mjs";

// The four migration files of phases P3 and P5; the fourth file holds the audit queue of decision D69.
const MIGRATIONS = ["001_schema.sql", "002_triggers.sql", "003_policies.sql", "004_audit_outbox.sql"];

async function checkDatabase(pool) {
  const applied = new Set((await pool.query("SELECT name FROM schema_migrations")).rows.map((row) => row.name));
  const missing = MIGRATIONS.filter((name) => !applied.has(name));
  if (missing.length > 0) throw new Error(`The schema lacks the migrations ${missing.join(", ")}. Run the command npm run migrate first.`);
  const settings = await pool.query("SELECT count(*) AS settings FROM pg_db_role_setting s JOIN pg_roles r ON r.oid = s.setrole WHERE r.rolname = current_user");
  if (Number(settings.rows[0].settings) > 0) {
    throw new Error("The role of the connection holds stored settings in pg_db_role_setting. Run the command npm run create-role, which removes them.");
  }
}

// The implementations of the four ports of the binding. With BINDING=memory the server reaches no
// partner: the resolver holds two empty maps, and every notification ends as receiver_unresolved.
async function bindingOf(config, appHolder, logger) {
  if (config.binding === "memory") {
    const offerStore = createMemoryOfferStore();
    const participants = new Map();
    const transport = createMemoryTransport({ participants, offerStores: new Map([[config.ownBpnl, offerStore]]), ownBpnl: config.ownBpnl });
    appHolder.register = (app) =>
      participants.set(config.publicBaseUrl, {
        bpnl: config.ownBpnl,
        app,
        dataPlaneKey: config.dataPlaneKey,
        dataPlaneKeyHeader: config.dataPlaneKeyHeader,
        partnerBpnHeader: config.partnerBpnHeader,
      });
    return {
      transport,
      offerStore,
      twinRegistry: createMemoryTwinRegistry(),
      receiverResolver: createMemoryReceiverResolver({ didByBpnl: new Map(), connectorUrlByDid: new Map() }),
    };
  }
  const resolverModule = config.receiverResolution === "address-list" ? "./connector/addressListResolver.mjs" : "./connector/connectorDiscoveryResolver.mjs";
  const [edcTransport, edcOfferStore, dtrTwinRegistry, resolver] = await Promise.all([
    import("./connector/edcTransport.mjs"),
    import("./connector/edcOfferStore.mjs"),
    import("./twins/dtrTwinRegistry.mjs"),
    import(resolverModule),
  ]).catch((error) => {
    throw new Error(`connector binding not available: ${error.message}`);
  });
  appHolder.register = () => {};
  return {
    transport: edcTransport.createEdcTransport({ config, fetch }),
    offerStore: edcOfferStore.createEdcOfferStore({ config, fetch }),
    twinRegistry: dtrTwinRegistry.createDtrTwinRegistry({ config, fetch }),
    receiverResolver: receiverResolverOf(config, resolver, logger),
  };
}

// The resolver of the connector binding that config.receiverResolution selects: the connector discovery
// of the own connector (D75), or the address list of a local test deployment (D81), whose use the server
// states at the level warn at the start.
function receiverResolverOf(config, resolver, logger) {
  if (config.receiverResolution === "address-list") {
    logger.warn("The receiver resolution uses the address list of a local test deployment.");
    return resolver.createAddressListResolver({ addressList: config.receiverAddressList });
  }
  return resolver.createConnectorDiscoveryResolver({ config, fetch });
}

async function main() {
  const config = loadConfig(process.env);
  const clock = { now: () => new Date() };
  const logger = createLogger({ level: config.logLevel, stream: process.stdout, clock, redactedFieldNames: [config.dataPlaneKeyHeader, config.edcManagementApiKeyHeader] });
  const pool = createPool({ connectionString: config.databaseUrl, schema: config.databaseSchema, size: config.databasePoolSize });
  try {
    await checkDatabase(pool);
    await upsertOwnCompany(pool, config);
    const holder = {};
    const ports = await bindingOf(config, holder, logger);
    const { app, worker } = createApp({ config, pool, clock, ...ports, logger });
    holder.register(app);
    await app.locals.context.offerPublisher.publishNotificationAsset();
    worker.start();
    // Express 5 calls the callback of listen also with an error, so the start is logged on the event
    // listening only.
    const server = app.listen(config.port);
    server.once("listening", () => logger.info("The reference server started.", { traceId: randomUUID(), port: config.port, binding: config.binding }));
    let stopping = null;
    const shutdown = (reason) => {
      stopping ??= (async () => {
        await worker.stop();
        server.close();
        server.closeAllConnections();
        await ports.transport.close?.();
        await pool.end();
      })();
      return stopping.catch((error) => {
        logger.error("The shutdown of the reference server failed.", { reason, error });
        process.exitCode = 1;
      });
    };
    // An error of the HTTP server, for example a port that another process holds, stops the worker,
    // ends the pool and ends the process with the status 1 (finding R45-017).
    server.on("error", (error) => {
      logger.error("The HTTP server of the reference server failed.", { port: config.port, code: error.code ?? null, error });
      process.exitCode = 1;
      shutdown("server error");
    });
    process.once("SIGTERM", () => {
      logger.info("The reference server stops.", { signal: "SIGTERM" });
      shutdown("SIGTERM");
    });
    process.once("SIGINT", () => {
      logger.info("The reference server stops.", { signal: "SIGINT" });
      shutdown("SIGINT");
    });
  } catch (error) {
    logger.error("The reference server did not start.", { error });
    await pool.end();
    process.exitCode = 1;
  }
}

try {
  await main();
} catch (error) {
  // loadConfig throws before the logger exists; the error names the variables and holds no value.
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}
