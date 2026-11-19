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

// Requirement: PrR-CXD-029 (Conformance tests run against the in-process binding and the connector
// binding), with decision D43 (One test code and two bindings) and decision D29 (The access regime and
// the admitted roles) and decision D84 (The connector binding on a started deployment) [waits for the
// owner]. Section 9.2.9 of docs/architecture/implementation_plan.md.
// The one entry of the sixteen test files: the variable TCK_BINDING selects the binding module, and
// both modules return the contract { provider, operator, recycler, settle(), stop() }.

// The seven variables of the deployment of tck/docker-compose.yml that the connector binding needs
// (section 9.2.9); only this module reads process.env (section 13.1).
function deploymentOf(env) {
  const value = (name) => (typeof env[name] === "string" && env[name].length > 0 ? env[name] : null);
  return Object.freeze({
    operatorTokenSecret: value("TCK_OPERATOR_TOKEN_SECRET"),
    managementApiKey: value("TCK_EDC_MANAGEMENT_API_KEY"),
    dataPlaneKey1: value("TCK_DATA_PLANE_KEY_1"),
    dataPlaneKey2: value("TCK_DATA_PLANE_KEY_2"),
    dataPlaneKey3: value("TCK_DATA_PLANE_KEY_3"),
    accessRegime: value("TCK_ACCESS_REGIME") ?? "after-act",
    passportServiceProviderBpnl: value("TCK_PASSPORT_SERVICE_PROVIDER_BPNL"),
  });
}

const BINDINGS = Object.freeze({
  "in-process": async (options) => (await import("./inProcessBinding.mjs")).startInProcessBinding(options),
  connector: async (options) => {
    let module;
    try {
      module = await import("./connectorBinding.mjs");
    } catch (error) {
      throw new Error(`connector binding not available: ${error.message}`);
    }
    return module.startConnectorBinding(options, deploymentOf(process.env));
  },
});

// Starts the binding of TCK_BINDING with the access regime (after-act by default) and the passport
// service provider (no value by default) in the configuration of each participant.
export async function startBinding({ accessRegime = "after-act", passportServiceProviderBpnl } = {}) {
  const name = process.env.TCK_BINDING;
  if (!Object.hasOwn(BINDINGS, name ?? "")) throw new Error(`TCK_BINDING must be in-process or connector, not ${JSON.stringify(name ?? null)}`);
  return BINDINGS[name]({ accessRegime, passportServiceProviderBpnl });
}
