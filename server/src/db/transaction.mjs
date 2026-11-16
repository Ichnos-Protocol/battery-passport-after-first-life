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
// and SwR-RDB-007 (Dataset writes only by the responsible or an authorised operator).
// The one place that starts a transaction of the server (EL-RDB, the relational database).

// Runs the work in one transaction at the isolation level READ COMMITTED, with the two transaction
// settings that the policies and the rule after the waste status read: app.acting_bpnl, the Business
// Partner Number of the acting company, and app.today, the current UTC date in the form YYYY-MM-DD.
// The function commits when the work resolves and rolls back when the work rejects.
export async function withTransaction(pool, { actingBpnl, today }, work) {
  if (typeof actingBpnl !== "string" || actingBpnl.length === 0) {
    throw new Error("withTransaction needs the Business Partner Number of the acting company.");
  }
  if (typeof today !== "string" || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(today)) {
    throw new Error("withTransaction needs the current UTC date in the form YYYY-MM-DD.");
  }
  const client = await pool.connect();
  let releaseError;
  try {
    await client.query("BEGIN ISOLATION LEVEL READ COMMITTED READ WRITE");
    await client.query("SELECT set_config('app.acting_bpnl', $1, true)", [actingBpnl]);
    await client.query("SELECT set_config('app.today', $1, true)", [today]);
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      // The pool destroys a connection that cannot roll back and never reuses the connection.
      releaseError = rollbackError;
    }
    throw error;
  } finally {
    client.release(releaseError);
  }
}
