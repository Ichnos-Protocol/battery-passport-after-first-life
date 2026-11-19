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
// SwR-TWINS-154 (New PartInstance twin registered for a new passport, originals untouched). Section
// 9.2.6 of docs/architecture/implementation_plan.md (the twin registry contract).
// The twin registry of the memory binding (EL-TWINS, the twin registration): the registered shells of
// one participant, held in the memory of the process.

// Returns a twin registry with the methods put, which registers a shell or replaces the registered
// shell with the same id, and read, which resolves to the shell or to null.
export function createMemoryTwinRegistry() {
  const shells = new Map();
  return Object.freeze({
    async put(shell) {
      if (shell === null || typeof shell !== "object" || typeof shell.id !== "string" || shell.id.length === 0) {
        throw new TypeError("put needs a shell with an id");
      }
      shells.set(shell.id, structuredClone(shell));
    },
    async read(shellId) {
      return shells.has(shellId) ? structuredClone(shells.get(shellId)) : null;
    },
  });
}
