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

// Requirements: SwR-TWINS-110 (A new PartInstance twin for a treated battery placed again),
// SwR-TWINS-154 (New PartInstance twin registered for a new passport, originals untouched) and
// SwR-CXCLIENT-182 (Lifecycle record offer restricted to purchaser, operators and authorities), with
// decision D23 (The exposure after the commit) and decision D33 (The offers of an ended passport) [waits
// for the owner]. Section 9.2.5 of
// docs/architecture/implementation_plan.md.
// The exposure of a passport and of a battery model after the commit of a step (EL-CXCLIENT, the
// connector client): the registration of the shell and the publication of the offers. A failure of
// the registry or of the offer store leaves the stored step in place and is answered as a result.
import { withTransaction } from "../db/transaction.mjs";
import { isDatabaseError } from "../dataset/refusals.mjs";
import { buildPartInstanceShell, buildPartTypeShell, partInstanceAspectKeys } from "../twins/shellDescriptor.mjs";

// The four fixed texts of the field cause (finding R45-014). No message of the database or of a
// dependency reaches a response; the log line holds the detail.
export const FAILURE_CAUSES = Object.freeze({
  registry: "the twin registry failed",
  offerStore: "the offer store failed",
  database: "the database failed",
  call: "the call failed",
});

const FAILURE_KIND = Symbol("failure kind");

// Runs a call of a dependency and marks an error that is no error of the database with the kind of the
// dependency.
export async function callOf(kind, work) {
  try {
    return await work();
  } catch (error) {
    if (error !== null && typeof error === "object" && !isDatabaseError(error) && error[FAILURE_KIND] === undefined) error[FAILURE_KIND] = kind;
    throw error;
  }
}

// The fixed text of a caught error.
export function failureCause(error) {
  if (isDatabaseError(error)) return FAILURE_CAUSES.database;
  const kind = error !== null && typeof error === "object" ? error[FAILURE_KIND] : undefined;
  return FAILURE_CAUSES[kind] ?? FAILURE_CAUSES.call;
}

// Returns the two refresh functions. Each reads in a transaction of its own and resolves to
// { refreshed: true } or { refreshed: false, cause }, and never throws for a failure.
export function createExposure({ config, clock, twinRegistry, offerPublisher, passportRepository, accessMapRepository, logger }) {
  const transactionOptions = () => ({ actingBpnl: config.ownBpnl, today: clock.now().toISOString().slice(0, 10) });

  async function refresh(pool, fields, work) {
    try {
      await withTransaction(pool, transactionOptions(), work);
      return { refreshed: true };
    } catch (error) {
      logger.error("The refresh of the exposure failed.", { ...fields, error });
      return { refreshed: false, cause: failureCause(error) };
    }
  }

  async function refreshPassportExposure({ pool, passportId }) {
    return refresh(pool, { passportId }, async (client) => {
      const passport = await passportRepository.findPassport(client, passportId);
      if (passport === null) throw new Error(`the deployment holds no passport ${passportId}`);
      const model = await passportRepository.findBatteryModel(client, passport.battery_model_id);
      const ended = passport.recycling_date !== null;
      // Decision D33 [waits for the owner]: a refresh of an ended passport withdraws the dataset offers
      // first, so that EP-TWIN repairs a withdrawal that failed after the end (finding R45-013).
      if (ended) await callOf("offerStore", () => offerPublisher.withdrawDatasetOffers({ passportId }));
      const aspectKeys = partInstanceAspectKeys({
        storedAspectKeys: ended ? [] : await passportRepository.listStoredAspectKeys(client, passportId),
        hasLineageLink: (await passportRepository.listLineageLinks(client, passportId)).length > 0,
        hasWasteSuccessor: passport.waste_successor_bpnl !== null,
        hasEnded: ended,
        hasSuccessorLink: (await passportRepository.listSuccessorLinks(client, passportId)).length > 0,
      });
      await callOf("registry", () => twinRegistry.put(buildPartInstanceShell({ passport, model, aspectKeys, config })));
      await callOf("offerStore", () => offerPublisher.publishPassportOffers({ client, passportId }));
    });
  }

  async function refreshModelExposure({ pool, modelId }) {
    return refresh(pool, { modelId }, async (client) => {
      const model = await passportRepository.findBatteryModel(client, modelId);
      if (model === null) throw new Error(`the deployment holds no battery model ${modelId}`);
      const hasAccessMap = await accessMapRepository.hasAccessMapVersion(client, modelId);
      await callOf("registry", () => twinRegistry.put(buildPartTypeShell({ model, hasAccessMap, config })));
      if (hasAccessMap) await callOf("offerStore", () => offerPublisher.publishAccessMapOffer({ modelId }));
    });
  }

  return Object.freeze({ refreshPassportExposure, refreshModelExposure });
}
