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

// Requirements: SwR-BGWORK-010 (Lifecycle notifications sent unchanged as JSON POST through the
// connector), SwR-BGWORK-020 (End of a recycled battery's passport sent in time) and SwR-AUDIT-045
// (Dataset write decisions recorded with the authorisation relied on), with decision D1 (The delay of the
// end notice), decision D22 (The outbox) and decision D69 (The audit record after a failed write is
// queued). System requirement SyR-LIFE-127 (End of a recycled battery's passport made known to the
// provider). Section 9.2.5 of docs/architecture/implementation_plan.md.
// The worker of the background work (EL-BGWORK, the background work): one run sends the due
// notifications, pulls the pending battery information and writes the queued audit records.

// Returns { start(), stop(), tick() }. A call of tick() during a running tick() returns the promise of
// the running call, so two runs never overlap in one process. An error of one of the three calls is
// logged at the level error and does not stop the two other calls.
export function createOutboxWorker({ sender, puller, audit, intervalMilliseconds, logger }) {
  let running = null;
  let timer = null;
  let started = false;

  async function step(work, message) {
    try {
      await work();
    } catch (error) {
      logger.error(message, { error });
    }
  }

  async function run() {
    await step(() => sender.sendDue(), "The sender of the outbox failed.");
    await step(() => puller.pullDue(), "The puller of the battery information failed.");
    await step(() => audit.writeQueued(), "The writer of the queued audit records failed.");
  }

  function tick() {
    if (running === null) {
      running = run().finally(() => {
        running = null;
      });
    }
    return running;
  }

  function schedule() {
    if (!started) return;
    timer = setTimeout(() => {
      timer = null;
      tick().then(schedule);
    }, intervalMilliseconds);
  }

  function start() {
    if (started) return;
    started = true;
    schedule();
  }

  async function stop() {
    started = false;
    if (timer !== null) clearTimeout(timer);
    timer = null;
    if (running !== null) await running;
  }

  return Object.freeze({ start, stop, tick });
}
