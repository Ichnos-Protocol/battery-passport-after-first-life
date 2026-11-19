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

// Contract: sections 9.2.1 and 9.6 of docs/architecture/implementation_plan.md (the configuration
// reader) and decision D24 (Two database roles and row-level security), whose protection of the
// credentials forbids a value of a variable in an error. No requirement of the registry names the
// configuration reader (section 17.2 of the specification).
// The one reader of the configuration of the reference server (EL-BACKEND, the HTTP API). The
// function loadConfig is a pure function of its argument: the module reads no environment variable
// and creates no client.
import nameplateSchema from "../../sources/IDTA/io.admin-shell.idta.batterypass.digital_nameplate/1.0.0/gen/NameplateBattery-schema.json" with { type: "json" };

import { BPNL_PATTERN } from "./identifiers.mjs";
import { LOG_LEVELS } from "./logger.mjs";
import { createAspectSchemaCompiler } from "./validation/aspectSchemaCompiler.mjs";

const NAMEPLATE_SCHEMA_KEY = "stored-nameplate-schema";
const addressCompiler = createAspectSchemaCompiler();
addressCompiler.addSchema(nameplateSchema, NAMEPLATE_SCHEMA_KEY);
// The definition of the element AddressInformation of the stored nameplate schema.
const validateAddress = addressCompiler.getSchema(`${NAMEPLATE_SCHEMA_KEY}#/components/schemas/AddressInformationCharacteristic`);

const DEFAULT_DATA_PLANE_PUBLIC_URL = "http://data-plane.memory.invalid/api/public";
const DEFAULT_DSP_URL = "http://control-plane.memory.invalid/api/v1/dsp";
const SCHEMA_NAME_PATTERN = /^[a-z_][a-z0-9_]{0,62}$/;
const HEADER_NAME_PATTERN = /^[A-Za-z0-9-]{1,64}$/;
const DECIMAL_DIGITS = /^[0-9]+$/;

// The error of loadConfig. The error names every missing or malformed variable and never holds the
// value of a variable, because a value can be a key or a password.
export class ConfigError extends Error {
  constructor(problems) {
    super(`Invalid configuration: ${problems.map((problem) => problem.text).join("; ")}`);
    this.name = "ConfigError";
    this.variables = Object.freeze(problems.map((problem) => problem.variable));
  }
}

// The outcome of a check: a parsed value, or the rule of section 9.6 that the value fails.
const accepted = (value) => ({ value });
const refused = (rule) => ({ rule });

function textOfLength(minimum, maximum) {
  const rule = `a text of ${minimum} to ${maximum} characters`;
  return (text) => (text.length >= minimum && text.length <= maximum ? accepted(text) : refused(rule));
}
function minimumLength(minimum) {
  return (text) => (text.length >= minimum ? accepted(text) : refused(`a text of ${minimum} characters or more`));
}
function pattern(regularExpression, rule) {
  return (text) => (regularExpression.test(text) ? accepted(text) : refused(rule));
}
function oneOf(values) {
  const rule = `one of ${values.join(", ")}`;
  return (text) => (values.includes(text) ? accepted(text) : refused(rule));
}
function integer(minimum, maximum) {
  const rule = `an integer from ${minimum} to ${maximum}`;
  return (text) => {
    if (!DECIMAL_DIGITS.test(text)) return refused(rule);
    const value = Number(text);
    return value >= minimum && value <= maximum ? accepted(value) : refused(rule);
  };
}
function address(schemes, rule) {
  return (text) => {
    let url;
    try {
      url = new URL(text);
    } catch {
      return refused(rule);
    }
    return schemes.includes(url.protocol) ? accepted(text) : refused(rule);
  };
}
const httpAddress = address(["http:", "https:"], "an absolute address with the scheme http or https");
const headerName = (text) =>
  HEADER_NAME_PATTERN.test(text) ? accepted(text.toLowerCase()) : refused("a header name of 1 to 64 letters, digits and hyphens");
const bpnl = pattern(BPNL_PATTERN, "a Business Partner Number of the pattern ^BPNL[a-zA-Z0-9]{12}$");

function ownAddress(text) {
  const rule = "a JSON object that validates against the definition AddressInformation of the stored nameplate schema";
  let value;
  try {
    value = JSON.parse(text);
  } catch {
    return refused(rule);
  }
  if (value === null || typeof value !== "object" || Array.isArray(value)) return refused(rule);
  return validateAddress(value) ? accepted(value) : refused(rule);
}

function allowedBpnls(text) {
  const rule = "a JSON list of one Business Partner Number of the pattern ^BPNL[a-zA-Z0-9]{12}$ or more";
  let value;
  try {
    value = JSON.parse(text);
  } catch {
    return refused(rule);
  }
  if (!Array.isArray(value) || value.length === 0) return refused(rule);
  return value.every((item) => typeof item === "string" && BPNL_PATTERN.test(item)) ? accepted(value) : refused(rule);
}

// The 30 variables of section 9.6, in the order of its table, each with its property, its
// requirement, its default and its check.
const REQUIRED = "required";
const OPTIONAL = "optional";
const FOR_CONNECTOR = "required when BINDING is connector";
const VARIABLES = [
  { name: "OWN_BPNL", property: "ownBpnl", need: REQUIRED, check: bpnl },
  { name: "OWN_LEGAL_NAME", property: "ownLegalName", need: REQUIRED, check: textOfLength(1, 300) },
  { name: "OWN_LEGAL_NAME_LANGUAGE", property: "ownLegalNameLanguage", need: OPTIONAL, fallback: "en", check: pattern(/^[a-z]{2}$/, "a language code of the pattern ^[a-z]{2}$") },
  { name: "OWN_ADDRESS", property: "ownAddress", need: REQUIRED, check: ownAddress },
  { name: "OWN_OPERATOR_IDENTIFIER", property: "ownOperatorIdentifier", need: OPTIONAL, fallback: null, check: textOfLength(1, 200) },
  { name: "DATABASE_URL", property: "databaseUrl", need: REQUIRED, check: address(["postgres:", "postgresql:"], "an address with the scheme postgres or postgresql") },
  { name: "DATABASE_SCHEMA", property: "databaseSchema", need: OPTIONAL, fallback: "public", check: pattern(SCHEMA_NAME_PATTERN, "a schema name of the pattern ^[a-z_][a-z0-9_]{0,62}$") },
  { name: "DATABASE_POOL_SIZE", property: "databasePoolSize", need: OPTIONAL, fallback: 10, check: integer(4, 100) },
  { name: "PORT", property: "port", need: OPTIONAL, fallback: 8080, check: integer(1, 65535) },
  { name: "PUBLIC_BASE_URL", property: "publicBaseUrl", need: REQUIRED, check: httpAddress, transform: (text) => text.replace(/\/+$/, "") },
  { name: "BINDING", property: "binding", need: REQUIRED, check: oneOf(["memory", "connector"]) },
  { name: "OPERATOR_TOKEN_SECRET", property: "operatorTokenSecret", need: REQUIRED, check: minimumLength(32) },
  { name: "DATA_PLANE_KEY", property: "dataPlaneKey", need: REQUIRED, check: minimumLength(32) },
  { name: "DATA_PLANE_KEY_HEADER", property: "dataPlaneKeyHeader", need: OPTIONAL, fallback: "x-api-key", check: headerName },
  { name: "PARTNER_BPN_HEADER", property: "partnerBpnHeader", need: OPTIONAL, fallback: "edc-bpn", check: headerName },
  { name: "ACCESS_REGIME", property: "accessRegime", need: REQUIRED, check: oneOf(["before-act", "after-act"]) },
  { name: "PASSPORT_ENDED_DELAY_SECONDS", property: "passportEndedDelaySeconds", need: OPTIONAL, fallback: 5, check: integer(0, 86400) },
  { name: "OUTBOX_INTERVAL_MILLISECONDS", property: "outboxIntervalMilliseconds", need: OPTIONAL, fallback: 1000, check: integer(10, 3600000) },
  { name: "NOTIFICATION_MAX_ATTEMPTS", property: "notificationMaxAttempts", need: OPTIONAL, fallback: 5, check: integer(1, 20) },
  { name: "NOTIFICATION_RETRY_SECONDS", property: "notificationRetrySeconds", need: OPTIONAL, fallback: 60, check: integer(1, 86400) },
  { name: "NOTIFICATION_ALLOWED_BPNLS", property: "notificationAllowedBpnls", need: OPTIONAL, fallback: null, check: allowedBpnls },
  { name: "PASSPORT_SERVICE_PROVIDER_BPNL", property: "passportServiceProviderBpnl", need: OPTIONAL, fallback: null, check: bpnl },
  { name: "CONNECTOR_DATA_PLANE_PUBLIC_URL", property: "connectorDataPlanePublicUrl", need: FOR_CONNECTOR, fallback: DEFAULT_DATA_PLANE_PUBLIC_URL, check: httpAddress },
  { name: "CONNECTOR_DSP_URL", property: "connectorDspUrl", need: FOR_CONNECTOR, fallback: DEFAULT_DSP_URL, check: httpAddress },
  { name: "EDC_MANAGEMENT_URL", property: "edcManagementUrl", need: FOR_CONNECTOR, fallback: null, check: httpAddress },
  { name: "EDC_MANAGEMENT_API_KEY", property: "edcManagementApiKey", need: FOR_CONNECTOR, fallback: null, check: minimumLength(32) },
  { name: "EDC_MANAGEMENT_API_KEY_HEADER", property: "edcManagementApiKeyHeader", need: OPTIONAL, fallback: "x-api-key", check: headerName },
  { name: "DTR_URL", property: "dtrUrl", need: FOR_CONNECTOR, fallback: null, check: httpAddress },
  { name: "BPN_DID_RESOLUTION_URL", property: "bpnDidResolutionUrl", need: FOR_CONNECTOR, fallback: null, check: httpAddress },
  { name: "LOG_LEVEL", property: "logLevel", need: OPTIONAL, fallback: "info", check: oneOf(LOG_LEVELS) },
];

function deepFreeze(value) {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    for (const item of Object.values(value)) deepFreeze(item);
    Object.freeze(value);
  }
  return value;
}

// Returns the frozen configuration object of section 9.6, or throws one ConfigError that names every
// missing or malformed variable in the order of the table of section 9.6.
export function loadConfig(env) {
  const source = env !== null && typeof env === "object" ? env : {};
  const read = (name) => {
    const value = Object.hasOwn(source, name) ? source[name] : undefined;
    return typeof value === "string" && value.length > 0 ? value : undefined;
  };
  const connector = read("BINDING") === "connector";
  const problems = [];
  const config = {};
  for (const variable of VARIABLES) {
    const text = read(variable.name);
    if (text === undefined) {
      const required = variable.need === REQUIRED || (variable.need === FOR_CONNECTOR && connector);
      if (required) problems.push({ variable: variable.name, text: `${variable.name} is missing` });
      else config[variable.property] = variable.fallback;
      continue;
    }
    const outcome = variable.check(text);
    if (Object.hasOwn(outcome, "rule")) {
      problems.push({ variable: variable.name, text: `${variable.name} is malformed: ${outcome.rule}` });
      continue;
    }
    config[variable.property] = variable.transform ? variable.transform(outcome.value) : outcome.value;
  }
  if (problems.length > 0) throw new ConfigError(problems);
  return deepFreeze(config);
}
