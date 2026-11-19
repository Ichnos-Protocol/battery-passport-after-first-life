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

// Requirements: SwR-TWINS-110 (A new PartInstance twin for a treated battery placed again) and
// SwR-TWINS-154 (New PartInstance twin registered for a new passport, originals untouched), with decision
// D77 (OAuth2 off in the local registry) and decision D78 (No credential of the registry in the server)
// [waits for the owner]. Section 9.2.6 of docs/architecture/implementation_plan.md (the twin registry
// contract).
// The twin registry of the connector binding (EL-TWINS, the twin registration): the own Digital Twin
// Registry 0.13.0 at config.dtrUrl, the address with the path prefix /api/v3 (sldt-digital-twin-registry
// at the tag v0.13.0, backend/src/main/resources/static/aas-registry-openapi.yaml lines 38, 60 and 196).
// The identifier of a shell is base64url-encoded in the path. A PUT creates a missing shell (201) and
// replaces a registered shell (204); a GET answers 404 for a shell that the reader may not see. The
// registry shows a shell only to its owning tenant, which the reader names in the header Edc-Bpn
// (docs/guideline-edc-extension-configuration.md line 17; recorded on 2026-11-19, tck/README.md,
// section "The recorded answers of phase P7").

const TENANT_HEADER = "Edc-Bpn";

// Returns a twin registry with the methods put and read of the twin registry contract.
export function createDtrTwinRegistry({ config, fetch }) {
  const addressOf = (shellId) => `${config.dtrUrl}/shell-descriptors/${Buffer.from(shellId, "utf8").toString("base64url")}`;

  async function put(shell) {
    if (shell === null || typeof shell !== "object" || typeof shell.id !== "string" || shell.id.length === 0) throw new TypeError("put needs a shell with an id");
    const response = await fetch(addressOf(shell.id), {
      method: "PUT",
      headers: { "content-type": "application/json", [TENANT_HEADER]: config.ownBpnl },
      body: JSON.stringify(shell),
    });
    if (response.status !== 201 && response.status !== 204) throw new Error(`the twin registry answered the registration with ${response.status}`);
  }

  async function read(shellId) {
    const response = await fetch(addressOf(shellId), { headers: { [TENANT_HEADER]: config.ownBpnl } });
    if (response.status === 404) return null;
    if (response.status !== 200) throw new Error(`the twin registry answered the read with ${response.status}`);
    return response.json();
  }

  return Object.freeze({ put, read });
}
