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

// Tests the configuration reader of server/src/config.mjs.
//
// Contracts that this file verifies (no requirement of the registry names the configuration reader,
// section 17.2 of the implementation specification):
//   sections 9.2.1 and 9.6 of docs/architecture/implementation_plan.md (the configuration reader)
//   decision D24 (Two database roles and row-level security): no value of a variable in an error
import assert from "node:assert/strict";
import { test } from "node:test";

import { ConfigError, loadConfig } from "../src/config.mjs";

// Invented test data: no value names a real company, host or credential.
const OPERATOR_SECRET = "operator-token-secret-0123456789abcdef";
const DATA_PLANE_KEY = "data-plane-key-0123456789abcdefghijkl";
const MANAGEMENT_KEY = "management-api-key-0123456789abcdefgh";
const DATABASE_PASSWORD = "db-password-7f3e9a";
const DATABASE_URL = `postgres://refserver_app:${DATABASE_PASSWORD}@127.0.0.1:5432/refserver`;
const ADDRESS = {
  NationalCode: [{ en: "XX" }],
  CityTown: [{ en: "Example City" }],
  Street: [{ en: "Example Street 1" }],
  ZipCode: [{ en: "00000" }],
};
const ADDRESS_LIST = { BPNL00000000TCK2: { connectorUrl: "http://cp-2:8084/api/v1/dsp/2025-1", did: "did:web:stub%3A8080:BPNL00000000TCK2" } };
const CONNECTOR_VARIABLES = ["CONNECTOR_DATA_PLANE_PUBLIC_URL", "CONNECTOR_DSP_URL", "EDC_MANAGEMENT_URL", "EDC_MANAGEMENT_API_KEY", "DTR_URL"];

// One complete input of valid values with BINDING=memory.
function fixtureEnv() {
  return {
    OWN_BPNL: "BPNL00000000TCK1",
    OWN_LEGAL_NAME: "Example Battery Company",
    OWN_LEGAL_NAME_LANGUAGE: "de",
    OWN_ADDRESS: JSON.stringify(ADDRESS),
    OWN_OPERATOR_IDENTIFIER: "TCK-OPERATOR-0001",
    DATABASE_URL,
    DATABASE_SCHEMA: "tck_schema",
    DATABASE_POOL_SIZE: "12",
    PORT: "9090",
    PUBLIC_BASE_URL: "https://provider.example/",
    BINDING: "memory",
    RECEIVER_RESOLUTION: "address-list",
    RECEIVER_ADDRESS_LIST: JSON.stringify(ADDRESS_LIST),
    OPERATOR_TOKEN_SECRET: OPERATOR_SECRET,
    DATA_PLANE_KEY,
    DATA_PLANE_KEY_HEADER: "X-DP-Key",
    PARTNER_BPN_HEADER: "X-Partner-Bpn",
    ACCESS_REGIME: "after-act",
    PASSPORT_ENDED_DELAY_SECONDS: "7",
    OUTBOX_INTERVAL_MILLISECONDS: "500",
    NOTIFICATION_MAX_ATTEMPTS: "3",
    NOTIFICATION_RETRY_SECONDS: "30",
    NOTIFICATION_ALLOWED_BPNLS: '["BPNL00000000TCK2","BPNL00000000TCK3"]',
    PASSPORT_SERVICE_PROVIDER_BPNL: "BPNL00000000TCK6",
    CONNECTOR_DATA_PLANE_PUBLIC_URL: "https://data-plane.example/api/public",
    CONNECTOR_DSP_URL: "https://control-plane.example/api/v1/dsp",
    EDC_MANAGEMENT_URL: "https://control-plane.example/management",
    EDC_MANAGEMENT_API_KEY: MANAGEMENT_KEY,
    EDC_MANAGEMENT_API_KEY_HEADER: "X-Mgmt-Key",
    DTR_URL: "https://registry.example/api/v3",
    LOG_LEVEL: "debug",
  };
}

// The property of each of the 31 variables of section 9.6 for the input of fixtureEnv().
const EXPECTED = {
  OWN_BPNL: ["ownBpnl", "BPNL00000000TCK1"],
  OWN_LEGAL_NAME: ["ownLegalName", "Example Battery Company"],
  OWN_LEGAL_NAME_LANGUAGE: ["ownLegalNameLanguage", "de"],
  OWN_ADDRESS: ["ownAddress", ADDRESS],
  OWN_OPERATOR_IDENTIFIER: ["ownOperatorIdentifier", "TCK-OPERATOR-0001"],
  DATABASE_URL: ["databaseUrl", DATABASE_URL],
  DATABASE_SCHEMA: ["databaseSchema", "tck_schema"],
  DATABASE_POOL_SIZE: ["databasePoolSize", 12],
  PORT: ["port", 9090],
  PUBLIC_BASE_URL: ["publicBaseUrl", "https://provider.example"],
  BINDING: ["binding", "memory"],
  RECEIVER_RESOLUTION: ["receiverResolution", "address-list"],
  RECEIVER_ADDRESS_LIST: ["receiverAddressList", ADDRESS_LIST],
  OPERATOR_TOKEN_SECRET: ["operatorTokenSecret", OPERATOR_SECRET],
  DATA_PLANE_KEY: ["dataPlaneKey", DATA_PLANE_KEY],
  DATA_PLANE_KEY_HEADER: ["dataPlaneKeyHeader", "x-dp-key"],
  PARTNER_BPN_HEADER: ["partnerBpnHeader", "x-partner-bpn"],
  ACCESS_REGIME: ["accessRegime", "after-act"],
  PASSPORT_ENDED_DELAY_SECONDS: ["passportEndedDelaySeconds", 7],
  OUTBOX_INTERVAL_MILLISECONDS: ["outboxIntervalMilliseconds", 500],
  NOTIFICATION_MAX_ATTEMPTS: ["notificationMaxAttempts", 3],
  NOTIFICATION_RETRY_SECONDS: ["notificationRetrySeconds", 30],
  NOTIFICATION_ALLOWED_BPNLS: ["notificationAllowedBpnls", ["BPNL00000000TCK2", "BPNL00000000TCK3"]],
  PASSPORT_SERVICE_PROVIDER_BPNL: ["passportServiceProviderBpnl", "BPNL00000000TCK6"],
  CONNECTOR_DATA_PLANE_PUBLIC_URL: ["connectorDataPlanePublicUrl", "https://data-plane.example/api/public"],
  CONNECTOR_DSP_URL: ["connectorDspUrl", "https://control-plane.example/api/v1/dsp"],
  EDC_MANAGEMENT_URL: ["edcManagementUrl", "https://control-plane.example/management"],
  EDC_MANAGEMENT_API_KEY: ["edcManagementApiKey", MANAGEMENT_KEY],
  EDC_MANAGEMENT_API_KEY_HEADER: ["edcManagementApiKeyHeader", "x-mgmt-key"],
  DTR_URL: ["dtrUrl", "https://registry.example/api/v3"],
  LOG_LEVEL: ["logLevel", "debug"],
};

// The default of each optional variable of section 9.6 under BINDING=memory.
const DEFAULTS = {
  OWN_LEGAL_NAME_LANGUAGE: ["ownLegalNameLanguage", "en"],
  OWN_OPERATOR_IDENTIFIER: ["ownOperatorIdentifier", null],
  DATABASE_SCHEMA: ["databaseSchema", "public"],
  DATABASE_POOL_SIZE: ["databasePoolSize", 10],
  PORT: ["port", 8080],
  RECEIVER_RESOLUTION: ["receiverResolution", "discovery"],
  DATA_PLANE_KEY_HEADER: ["dataPlaneKeyHeader", "x-api-key"],
  PARTNER_BPN_HEADER: ["partnerBpnHeader", "edc-bpn"],
  PASSPORT_ENDED_DELAY_SECONDS: ["passportEndedDelaySeconds", 5],
  OUTBOX_INTERVAL_MILLISECONDS: ["outboxIntervalMilliseconds", 1000],
  NOTIFICATION_MAX_ATTEMPTS: ["notificationMaxAttempts", 5],
  NOTIFICATION_RETRY_SECONDS: ["notificationRetrySeconds", 60],
  NOTIFICATION_ALLOWED_BPNLS: ["notificationAllowedBpnls", null],
  PASSPORT_SERVICE_PROVIDER_BPNL: ["passportServiceProviderBpnl", null],
  CONNECTOR_DATA_PLANE_PUBLIC_URL: ["connectorDataPlanePublicUrl", "http://data-plane.memory.invalid/api/public"],
  CONNECTOR_DSP_URL: ["connectorDspUrl", "http://control-plane.memory.invalid/api/v1/dsp"],
  EDC_MANAGEMENT_URL: ["edcManagementUrl", null],
  EDC_MANAGEMENT_API_KEY: ["edcManagementApiKey", null],
  EDC_MANAGEMENT_API_KEY_HEADER: ["edcManagementApiKeyHeader", "x-api-key"],
  DTR_URL: ["dtrUrl", null],
  LOG_LEVEL: ["logLevel", "info"],
};
const REQUIRED = ["OWN_BPNL", "OWN_LEGAL_NAME", "OWN_ADDRESS", "DATABASE_URL", "PUBLIC_BASE_URL", "BINDING", "OPERATOR_TOKEN_SECRET", "DATA_PLANE_KEY", "ACCESS_REGIME"];
const ADDRESS_VARIABLES = ["PUBLIC_BASE_URL", "CONNECTOR_DATA_PLANE_PUBLIC_URL", "CONNECTOR_DSP_URL", "EDC_MANAGEMENT_URL", "DTR_URL"];
const HEADER_VARIABLES = ["DATA_PLANE_KEY_HEADER", "PARTNER_BPN_HEADER", "EDC_MANAGEMENT_API_KEY_HEADER"];
const KEY_VARIABLES = ["OPERATOR_TOKEN_SECRET", "DATA_PLANE_KEY", "EDC_MANAGEMENT_API_KEY"];

// The values of section 14.2 that fail the rule of each variable.
const MALFORMED = [
  ["RECEIVER_RESOLUTION", "dns"],
  ["RECEIVER_ADDRESS_LIST", JSON.stringify({ BPNL00000000TCK2: { connectorUrl: "http://connector.example/api/v1/dsp", did: "did:web:connector.example" } })],
  ["RECEIVER_ADDRESS_LIST", JSON.stringify({ BPNL00000000TCK2: { connectorUrl: "http://cp-2:8084/api/v1/dsp" } })],
  ["RECEIVER_ADDRESS_LIST", "{}"],
  ["OWN_BPNL", "BPNL0000000TCK1"],
  ["PASSPORT_SERVICE_PROVIDER_BPNL", "BPNL0000000TCK1"],
  ["OWN_LEGAL_NAME", "x".repeat(301)],
  ["OWN_LEGAL_NAME_LANGUAGE", "EN"],
  ["OWN_ADDRESS", "[]"],
  ["OWN_ADDRESS", "street"],
  ["OWN_ADDRESS", JSON.stringify({ NationalCode: [{ en: "XX" }], CityTown: [{ en: "Example City" }], Street: [{ en: "Example Street 1" }] })],
  ["OWN_OPERATOR_IDENTIFIER", "x".repeat(201)],
  ["DATABASE_URL", "mysql://refserver_app@127.0.0.1/refserver"],
  ["DATABASE_SCHEMA", "Public"],
  ["DATABASE_POOL_SIZE", "3"],
  ["DATABASE_POOL_SIZE", "101"],
  ["DATABASE_POOL_SIZE", "4.5"],
  ["PORT", "0"],
  ["PORT", "65536"],
  ...ADDRESS_VARIABLES.flatMap((name) => [
    [name, "ftp://x"],
    [name, "relative/path"],
  ]),
  ["BINDING", "file"],
  ...KEY_VARIABLES.map((name) => [name, "k".repeat(31)]),
  ...HEADER_VARIABLES.map((name) => [name, "x api key"]),
  ["ACCESS_REGIME", "during-act"],
  ["PASSPORT_ENDED_DELAY_SECONDS", "-1"],
  ["PASSPORT_ENDED_DELAY_SECONDS", "86401"],
  ["OUTBOX_INTERVAL_MILLISECONDS", "9"],
  ["NOTIFICATION_MAX_ATTEMPTS", "0"],
  ["NOTIFICATION_MAX_ATTEMPTS", "21"],
  ["NOTIFICATION_RETRY_SECONDS", "0"],
  ["NOTIFICATION_ALLOWED_BPNLS", "[]"],
  ["NOTIFICATION_ALLOWED_BPNLS", "{}"],
  ["NOTIFICATION_ALLOWED_BPNLS", '["BPNL1"]'],
  ["LOG_LEVEL", "trace"],
];

// The secrets of every input, which no message of an error may hold.
const SECRETS = [OPERATOR_SECRET, DATA_PLANE_KEY, MANAGEMENT_KEY, DATABASE_PASSWORD, DATABASE_URL];

function configError(env) {
  try {
    loadConfig(env);
  } catch (error) {
    assert.ok(error instanceof ConfigError, `the error is a ConfigError: ${error}`);
    assert.ok(error instanceof Error);
    for (const secret of SECRETS) assert.equal(error.message.includes(secret), false, "the message holds no key, password or connection string of the input");
    for (const value of Object.values(env)) {
      if (typeof value === "string" && value.length >= 8 && !/^[A-Z_]+$/.test(value)) assert.equal(error.message.includes(value), false, "the message holds no value of the input");
    }
    return error;
  }
  return assert.fail("loadConfig returned a configuration");
}

function without(env, ...names) {
  const copy = { ...env };
  for (const name of names) delete copy[name];
  return copy;
}

test("section 9.6: one accepted value of each of the 31 variables gives its property with its type", async (t) => {
  const config = loadConfig(fixtureEnv());
  assert.equal(Object.keys(EXPECTED).length, 31);
  for (const [variable, [property, value]] of Object.entries(EXPECTED)) {
    await t.test(`${variable} gives ${property}`, () => {
      assert.deepStrictEqual(config[property], value);
    });
  }
  await t.test("each integer is a number, NOTIFICATION_ALLOWED_BPNLS is a list, OWN_ADDRESS is an object and each header name is in lower case", () => {
    for (const property of ["databasePoolSize", "port", "passportEndedDelaySeconds", "outboxIntervalMilliseconds", "notificationMaxAttempts", "notificationRetrySeconds"]) {
      assert.equal(typeof config[property], "number", property);
    }
    assert.ok(Array.isArray(config.notificationAllowedBpnls));
    assert.equal(typeof config.ownAddress, "object");
    for (const property of ["dataPlaneKeyHeader", "partnerBpnHeader", "edcManagementApiKeyHeader"]) assert.equal(config[property], config[property].toLowerCase());
  });
  await t.test("the scheme postgresql of DATABASE_URL and the scheme http of an address are accepted", () => {
    const accepted = loadConfig({ ...fixtureEnv(), DATABASE_URL: "postgresql://refserver_app@127.0.0.1/refserver", PUBLIC_BASE_URL: "http://provider.example" });
    assert.equal(accepted.databaseUrl, "postgresql://refserver_app@127.0.0.1/refserver");
    assert.equal(accepted.publicBaseUrl, "http://provider.example");
  });
});

test("section 9.6: a value that fails the rule of its variable throws a ConfigError that names the variable", async (t) => {
  for (const [variable, value] of MALFORMED) {
    await t.test(`${variable} with a malformed value (${value.length > 40 ? `${value.length} characters` : value})`, () => {
      const error = configError({ ...fixtureEnv(), [variable]: value });
      assert.deepStrictEqual(error.variables, [variable]);
      assert.ok(error.message.includes(`${variable} is malformed: `), error.message);
      assert.ok(error.message.startsWith("Invalid configuration: "));
    });
  }
});

test("section 9.6: a missing required variable is named with is missing", async (t) => {
  for (const variable of REQUIRED) {
    for (const [label, env] of [
      ["absent", without(fixtureEnv(), variable)],
      ["the empty text", { ...fixtureEnv(), [variable]: "" }],
    ]) {
      await t.test(`${variable} ${label}`, () => {
        const error = configError(env);
        assert.deepStrictEqual(error.variables, [variable]);
        assert.equal(error.message, `Invalid configuration: ${variable} is missing`);
      });
    }
  }
  await t.test("three missing variables and two malformed values give one ConfigError with the five names in the order of section 9.6", () => {
    const env = { ...without(fixtureEnv(), "OWN_LEGAL_NAME", "BINDING", "ACCESS_REGIME"), PORT: "0", LOG_LEVEL: "trace" };
    const error = configError(env);
    assert.deepStrictEqual(error.variables, ["OWN_LEGAL_NAME", "PORT", "BINDING", "ACCESS_REGIME", "LOG_LEVEL"]);
    assert.ok(error.message.startsWith("Invalid configuration: OWN_LEGAL_NAME is missing; PORT is malformed: "), error.message);
    assert.ok(error.message.includes("; BINDING is missing; ACCESS_REGIME is missing; LOG_LEVEL is malformed: "), error.message);
  });
});

test("section 9.6: the variables of the connector", async (t) => {
  for (const variable of CONNECTOR_VARIABLES) {
    await t.test(`with BINDING=connector, an absent ${variable} is named`, () => {
      const error = configError(without({ ...fixtureEnv(), BINDING: "connector" }, variable));
      assert.deepStrictEqual(error.variables, [variable]);
      assert.equal(error.message, `Invalid configuration: ${variable} is missing`);
    });
  }
  await t.test("with BINDING=connector, the five absent variables are named in the order of section 9.6", () => {
    const error = configError(without({ ...fixtureEnv(), BINDING: "connector" }, ...CONNECTOR_VARIABLES));
    assert.deepStrictEqual(error.variables, CONNECTOR_VARIABLES);
  });
  await t.test("with BINDING=connector and the five variables, the configuration holds their values", () => {
    const config = loadConfig({ ...fixtureEnv(), BINDING: "connector" });
    assert.equal(config.binding, "connector");
    assert.equal(config.edcManagementApiKey, MANAGEMENT_KEY);
  });
  await t.test("under BINDING=memory the three variables without a default are null", () => {
    const config = loadConfig(without(fixtureEnv(), ...CONNECTOR_VARIABLES));
    for (const property of ["edcManagementUrl", "edcManagementApiKey", "dtrUrl"]) assert.equal(config[property], null, property);
  });
});

test("section 9.6: every default is applied when its variable is absent and when its variable holds the empty text", async (t) => {
  for (const [variable, [property, value]] of Object.entries(DEFAULTS)) {
    await t.test(`${variable} absent gives ${JSON.stringify(value)}`, () => {
      assert.deepStrictEqual(loadConfig(without(fixtureEnv(), variable))[property], value);
    });
    await t.test(`${variable} empty gives ${JSON.stringify(value)}`, () => {
      assert.deepStrictEqual(loadConfig({ ...fixtureEnv(), [variable]: "" })[property], value);
    });
  }
});

test("section 9.2.1: the configuration object is frozen, pure and holds the 31 properties only", async (t) => {
  await t.test("the object, ownAddress and notificationAllowedBpnls are frozen, and an assignment throws a TypeError", () => {
    const config = loadConfig(fixtureEnv());
    for (const value of [config, config.ownAddress, config.notificationAllowedBpnls]) assert.equal(Object.isFrozen(value), true);
    assert.throws(() => {
      config.ownBpnl = "BPNL00000000TCK2";
    }, TypeError);
    assert.throws(() => {
      config.ownAddress.Street = [];
    }, TypeError);
    assert.throws(() => {
      config.notificationAllowedBpnls.push("BPNL00000000TCK4");
    }, TypeError);
  });
  await t.test("loadConfig reads only its argument and no value of process.env", () => {
    const before = process.env.OWN_BPNL;
    process.env.OWN_BPNL = "BPNL00000000TCK5";
    try {
      assert.equal(loadConfig(fixtureEnv()).ownBpnl, "BPNL00000000TCK1");
    } finally {
      if (before === undefined) delete process.env.OWN_BPNL;
      else process.env.OWN_BPNL = before;
    }
  });
  await t.test("two calls with equal inputs return equal objects", () => {
    assert.deepStrictEqual(loadConfig(fixtureEnv()), loadConfig(fixtureEnv()));
  });
  await t.test("a variable outside the table, UNKNOWN_SETTING, gives no property", () => {
    const config = loadConfig({ ...fixtureEnv(), UNKNOWN_SETTING: "value" });
    assert.deepStrictEqual(Object.keys(config).sort(), Object.values(EXPECTED).map(([property]) => property).sort());
  });
});

test("D81 (A fixed address list in the local deployment only): the address list serves only a local test deployment", async (t) => {
  await t.test("RECEIVER_ADDRESS_LIST absent under RECEIVER_RESOLUTION=address-list is named as missing", () => {
    const error = configError(without(fixtureEnv(), "RECEIVER_ADDRESS_LIST"));
    assert.deepStrictEqual(error.variables, ["RECEIVER_ADDRESS_LIST"]);
    assert.match(error.message, /RECEIVER_ADDRESS_LIST is missing/);
  });
  await t.test("RECEIVER_ADDRESS_LIST absent under RECEIVER_RESOLUTION=discovery gives null", () => {
    const config = loadConfig({ ...without(fixtureEnv(), "RECEIVER_ADDRESS_LIST"), RECEIVER_RESOLUTION: "discovery" });
    assert.equal(config.receiverAddressList, null);
  });
  await t.test("the hosts localhost, 127.0.0.1 and [::1] are admitted, and the list and its entries are frozen", () => {
    const list = {
      BPNL00000000TCK1: { connectorUrl: "http://localhost:8084/api/v1/dsp", did: "did:web:one" },
      BPNL00000000TCK2: { connectorUrl: "https://127.0.0.1:8084/api/v1/dsp", did: "did:web:two" },
      BPNL00000000TCK3: { connectorUrl: "http://[::1]:8084/api/v1/dsp", did: "did:web:three" },
    };
    const config = loadConfig({ ...fixtureEnv(), RECEIVER_ADDRESS_LIST: JSON.stringify(list) });
    assert.deepStrictEqual(config.receiverAddressList, list);
    assert.equal(Object.isFrozen(config.receiverAddressList), true);
    assert.equal(Object.isFrozen(config.receiverAddressList.BPNL00000000TCK1), true);
  });
  await t.test("an entry with a third property, a key that is no Business Partner Number and 101 entries are refused", () => {
    const entry = { connectorUrl: "http://cp-2:8084/api/v1/dsp", did: "did:web:two" };
    const many = Object.fromEntries(Array.from({ length: 101 }, (_, index) => [`BPNL0000000${String(index).padStart(5, "0")}`, entry]));
    for (const list of [{ BPNL00000000TCK2: { ...entry, extra: 1 } }, { BPNS00000000TCK1: entry }, many]) {
      assert.deepStrictEqual(configError({ ...fixtureEnv(), RECEIVER_ADDRESS_LIST: JSON.stringify(list) }).variables, ["RECEIVER_ADDRESS_LIST"]);
    }
  });
});
