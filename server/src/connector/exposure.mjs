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
// decision D23 (The exposure after the commit). Section 9.2.5 of
// docs/architecture/implementation_plan.md.
// The exposure of a passport and of a battery model after the commit of a step (EL-CXCLIENT, the
// connector client): the registration of the shell and the publication of the offers. A failure of
// the registry or of the offer store leaves the stored step in place and is answered as a result.
import { withTransaction } from "../db/transaction.mjs";
import { buildPartInstanceShell, buildPartTypeShell, partInstanceAspectKeys } from "../twins/shellDescriptor.mjs";

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
      return { refreshed: false, cause: String(error?.message ?? error) };
    }
  }

  async function refreshPassportExposure({ pool, passportId }) {
    return refresh(pool, { passportId }, async (client) => {
      const passport = await passportRepository.findPassport(client, passportId);
      if (passport === null) throw new Error(`the deployment holds no passport ${passportId}`);
      const model = await passportRepository.findBatteryModel(client, passport.battery_model_id);
      const ended = passport.recycling_date !== null;
      const aspectKeys = partInstanceAspectKeys({
        storedAspectKeys: ended ? [] : await passportRepository.listStoredAspectKeys(client, passportId),
        hasLineageLink: (await passportRepository.listLineageLinks(client, passportId)).length > 0,
        hasWasteSuccessor: passport.waste_successor_bpnl !== null,
        hasEnded: ended,
        hasSuccessorLink: (await passportRepository.listSuccessorLinks(client, passportId)).length > 0,
      });
      await twinRegistry.put(buildPartInstanceShell({ passport, model, aspectKeys, config }));
      await offerPublisher.publishPassportOffers({ client, passportId });
    });
  }

  async function refreshModelExposure({ pool, modelId }) {
    return refresh(pool, { modelId }, async (client) => {
      const model = await passportRepository.findBatteryModel(client, modelId);
      if (model === null) throw new Error(`the deployment holds no battery model ${modelId}`);
      const hasAccessMap = await accessMapRepository.hasAccessMapVersion(client, modelId);
      await twinRegistry.put(buildPartTypeShell({ model, hasAccessMap, config }));
      if (hasAccessMap) await offerPublisher.publishAccessMapOffer({ modelId });
    });
  }

  return Object.freeze({ refreshPassportExposure, refreshModelExposure });
}
