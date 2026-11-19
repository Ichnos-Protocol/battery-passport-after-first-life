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
// connector) and SwR-BGWORK-020 (End of a recycled battery's passport sent in time), with decision D1
// (The delay of the end notice) and decision D22 (The outbox). System requirement SyR-LIFE-127 (End of a
// recycled battery's passport made known to the provider). Section 9.2.5 of
// docs/architecture/implementation_plan.md.
// The worker of the background work (EL-BGWORK, the background work): one run sends the due
// notifications and then pulls the pending battery information.

// Returns { start(), stop(), tick() }. A call of tick() during a running tick() returns the promise of
// the running call, so two runs never overlap in one process. An error of the sender or of the puller
// is logged at the level error, and the run continues with the next step.
export function createOutboxWorker({ sender, puller, intervalMilliseconds, logger }) {
  let running = null;
  let timer = null;
  let started = false;

  async function run() {
    try {
      await sender.sendDue();
    } catch (error) {
      logger.error("The sender of the outbox failed.", { error });
    }
    try {
      await puller.pullDue();
    } catch (error) {
      logger.error("The puller of the battery information failed.", { error });
    }
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
