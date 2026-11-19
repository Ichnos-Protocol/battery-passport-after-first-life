# Conformance test kit

This folder holds the conformance test kit of the proposal CX-0160-4 (Battery Passport after the First Passport). The kit holds one test file per conformance criterion of Annex A of the proposal, from `CAC-001.tck.mjs` (CX-0160-4-CAC-001, New passport) to `CAC-016.tck.mjs` (CX-0160-4-CAC-016, Access map). Each file names its criterion in its first test title and reaches the reference server only through the binding contract of `lib/binding.mjs`.

## The two bindings

The variable `TCK_BINDING` selects the binding. Both bindings return the same contract: the three participants `provider` (the data provider of the original passports, `BPNL00000000TCK1`), `operator` (the second-life operator, `BPNL00000000TCK2`) and `recycler` (the recycler, the repairer and the waste receiver, `BPNL00000000TCK3`), and the two functions `settle()` and `stop()`.

- **The in-process binding** (`TCK_BINDING=in-process`, `lib/inProcessBinding.mjs`) starts three applications of the reference server in the process of the test file, each with its own schema of the test database, on one memory network: one memory transport per participant, one memory receiver resolver, one memory offer store and one memory twin registry per participant. The binding needs only Node.js and PostgreSQL. `settle()` advances the clock of the three applications by 6 seconds and runs the worker of each application twice.
- **The connector binding** (`TCK_BINDING=connector`, `lib/connectorBinding.mjs`) runs the sixteen files on a started deployment of `docker-compose.yml`: three reference servers, their Tractus-X EDC 0.13.0 connectors and their Digital Twin Registries (decision D84, The connector binding on a started deployment, which waits for the owner). The binding runs no docker command and restarts no server; each test file works on identifiers of its own. The second run of phase P7 below records the results and the cause of each failure, and the process requirement PrR-CXD-029 (Conformance tests run against the in-process binding and the connector binding) stays unverified for the connector binding until the owner decides.
- **The local deployment.** `docker-compose.yml` reads its images and its local test values from `tck/.env`, which git ignores; `.env.example` names every variable with a placeholder. The commands at the repository root are `docker compose -f tck/docker-compose.yml --env-file tck/.env up -d --wait` and `docker compose -f tck/docker-compose.yml --env-file tck/.env down -v`.
- **The notification asset of a participant.** Each participant of both bindings has the methods `withdrawNotificationAsset()` and `publishNotificationAsset()`, which withdraw and publish the lifecycle notification asset through the offer store of the participant (decision D74, The binding contract and criterion CAC-012 (notification API), which waits for the owner). `CAC-012.tck.mjs` uses the two methods to assert the record `no_asset` of a receiver without an asset.

`lib/scenario.mjs` holds the fixture builders that the sixteen files share. Each builder calls only the operator endpoints of the reference server.

## The commands

The test kit imports the reference server by relative paths, so the packages of `server/` are installed first. The in-process binding reads the two variables `TEST_DATABASE_URL` and `TEST_APP_ROLE_PASSWORD` of the server tests. At the repository root, in the shell of the implementation plan that holds the function `node24`:

```bash
node24 bash -c "cd server && npm ci && cd ../tck && npm ci && TCK_BINDING=in-process npm test && node ../scripts/check-dependency-licenses.mjs"
```

The command prints the lines `# fail 0`, `# skipped 0` and `0 packages outside the licence list`.

### The test images and their licences

The local deployment pulls these images at test time, and the repository distributes none of them (decision D82, HashiCorp Vault as a test-only image).

| Image | Use | Licence | Public address |
|---|---|---|---|
| `tractusx/edc-controlplane-postgresql-hashicorp-vault:0.13.0`, `tractusx/edc-dataplane-hashicorp-vault:0.13.0` | the control plane and the data plane of each connector | Apache-2.0 | tractusx-edc at the tag `0.13.0`, `LICENSE` |
| `tractusx/ssi-dim-wallet-stub:0.1.0` | the one wallet stub of the three connectors (decision D80, One wallet stub for the three companies) | Apache-2.0 | ssi-dim-wallet-stub at the tag `0.1.0` (commit `6734a1fe38c78b343799d7407ef318b6cd0c11de`), `LICENSE` lines 1 to 3 ("Apache License, Version 2.0, January 2004") and `README.md` line 142 ("Distributed under the Apache 2.0 License.") |
| `tractusx/bdrs-server-memory:0.6.0` | the BPN-DID Resolution Service | Apache-2.0 | bpn-did-resolution-service at the tag `0.6.0`, `LICENSE` |
| `tractusx/sldt-digital-twin-registry:0.13.0` | the Digital Twin Registry of each participant | Apache-2.0 | sldt-digital-twin-registry at the tag `v0.13.0`, `LICENSE` |
| `hashicorp/vault:1.16.1` | the secret store of each connector | Business Source License 1.1 (BUSL-1.1), not an open source licence; `NOTICE.md` names the image | `hashicorp/vault` at the tag `v1.16.1`, `LICENSE` lines 1 and 2 |
| `postgres:17`, `postgres:18.0` | the databases of the servers and of the registries, and the databases of the connectors | PostgreSQL licence | section 9.8 of the implementation plan |
| `node:24` | the reference servers, the seed service and the container of the test kit | MIT for Node.js | section 9.8 of the implementation plan |

### The commands of the connector binding

The connector binding runs on a started deployment and runs no docker command (decision D84, The connector binding on a started deployment). At the repository root, in Git Bash with `MSYS_NO_PATHCONV=1`, for each regime of section 9.2.9 of the implementation plan:

```bash
set -a; . tck/.env; set +a
ACCESS_REGIME=after-act PASSPORT_SERVICE_PROVIDER_BPNL= docker compose -f tck/docker-compose.yml --env-file tck/.env up -d --wait
docker run --rm --network tck_default -v "$(pwd -W):/work" -v bpafl_server_modules:/work/server/node_modules \
  -v bpafl_tck_modules:/work/tck/node_modules -w /work/tck -e TCK_BINDING=connector -e TCK_OPERATOR_TOKEN_SECRET \
  -e TCK_EDC_MANAGEMENT_API_KEY -e TCK_DATA_PLANE_KEY_1 -e TCK_DATA_PLANE_KEY_2 -e TCK_DATA_PLANE_KEY_3 \
  -e TCK_ACCESS_REGIME=after-act -e TCK_PASSPORT_SERVICE_PROVIDER_BPNL= node:24 \
  node --test --test-reporter=tap <the files of the regime>
docker compose -f tck/docker-compose.yml --env-file tck/.env down -v
```

The regime with the passport service provider sets `PASSPORT_SERVICE_PROVIDER_BPNL=BPNL00000000TCK6` and `TCK_PASSPORT_SERVICE_PROVIDER_BPNL=BPNL00000000TCK6` and runs `CAC-009.tck.mjs`; the regime before the act sets `ACCESS_REGIME=before-act` and `TCK_ACCESS_REGIME=before-act` and runs `CAC-011.tck.mjs`. After the default regime, `node --test connectorHeader.test.mjs` in the same container runs the header test.

## The verification of phase P7

The owner named Tractus-X EDC 0.13.0 on 2026-11-19 as the connector release of phase P7. The verification read, on 2026-11-19, the tag `0.13.0` of the repository `eclipse-tractusx/tractusx-edc` (commit `964d33d7ed942369f624aacbc45037a1f79fc7be`), the tag `v0.13.0` of `eclipse-tractusx/sldt-digital-twin-registry` (commit `c7ca6f9930a03543de94e7ebc3173266728a7a13`), the tag `0.6.0` of `eclipse-tractusx/bpn-did-resolution-service` (commit `fee8860b0404a85dba06a7380847dc2298b0e5a6`), the published Catena-X standards of the release CX-Neptune (preview) and of the current release CX-Titan at `https://catenax-ev.github.io/docs/`, and the image tags on Docker Hub. A path in the table names a file of the repository at the tag, with its line.

### The values

| Value | Text of the implementation plan | Verified value | Public address |
|---|---|---|---|
| The management API of the connector | `EDC_MANAGEMENT_URL`; the paths are not verified (section 9.6) | port 8081, path `/management`, version `v3`: `/v3/assets`, `/v3/policydefinitions`, `/v3/contractdefinitions`, `/v3/catalog/request`, `/v3/contractnegotiations`, `/v3/transferprocesses`, `/v3/edrs` and `/v3/edrs/<id>/dataaddress` | tractusx-edc `charts/tractusx-connector/README.md` lines 145 and 146; `docs/usage/management-api-walkthrough/01_assets.md` line 8, `02_policies.md` line 113, `03_contractdefinitions.md` line 8, `04_catalog.md` line 99, `05_contractnegotiations.md` line 14, `06_transferprocesses.md` line 33 and `07_edrs.md` lines 34 and 168 |
| The key header of the management API | `EDC_MANAGEMENT_API_KEY_HEADER`, default `x-api-key` | `X-Api-Key`, which is the same header name as `x-api-key` | `charts/tractusx-connector/README.md` line 143 |
| The public API of the data plane | `CONNECTOR_DATA_PLANE_PUBLIC_URL`, path `/api/public` | port 8081, path `/api/public` | `charts/tractusx-connector/README.md` lines 251 and 252 |
| The Dataspace Protocol address | `CONNECTOR_DSP_URL`, path `/api/v1/dsp` | port 8084, path `/api/v1/dsp`; the protocol version 2025-1 adds the segment `/2025-1`, which the connector discovery returns | `charts/tractusx-connector/README.md` lines 151 and 152; `04_catalog.md` lines 29 to 75 |
| The header of the data plane key | `DATA_PLANE_KEY_HEADER`, default `x-api-key` | the provider data plane sends a static header of every name that the data address declares as `header:<name>`, so the name `x-api-key` is admitted | `01_assets.md` lines 89 and 111 |
| The header of the consumer's Business Partner Number | `PARTNER_BPN_HEADER`, default `Edc-Bpn` | `Edc-Bpn`: the provider data plane sets the data address property `header:Edc-Bpn` from the data of the access token | `edc-extensions/dataplane/dataplane-token-refresh/token-refresh-core/src/main/java/org/eclipse/tractusx/edc/dataplane/tokenrefresh/core/DataPlaneTokenRefreshServiceImpl.java` line 347; `edc-tests/e2e-fixtures/src/testFixtures/java/org/eclipse/tractusx/edc/tests/transfer/ConsumerPullBaseTest.java` line 111 |
| The policy forms | an access list of Business Partner Numbers and the usage purpose `cx.circular.dpp:1` (section 10.5) | access policy: the constraint `BusinessPartnerNumber` with the operator `isAnyOf`; usage policy: the constraints `FrameworkAgreement` and `UsagePurpose` in one `and` conjunction; the Catena-X dataspace does not accept a usage policy without both constraints | `02_policies.md` lines 44, 57, 63, 97 to 105 and 225 to 262 |
| The contract definition form | not stated | an `assetsSelector` with the `operandLeft` `https://w3id.org/edc/v0.0.1/ns/id` | `03_contractdefinitions.md` lines 8 to 30 |
| The `dct:type` of a submodel offer | `SUBMODEL_DCT_TYPE` = `cx-taxo:Submodel`, without a version (section 10.5) | `cx-taxo:BatteryPass`, with `cx-common:version` `1.0` and `aas-semantics:semanticId` | CX-0160 section 4.1, `https://catenax-ev.github.io/docs/next/standards/CX-0160-BatteryPassport`; the changelog of the page lists version 1.1.0 of CX-Neptune (26.09) |
| The semantic identifier of IDTA-02035-2 | `urn:samm:io.admin-shell.idta.batterypass.handover_documentation:1.0.0#HandoverDocumentation` | the same identifier | CX-0160 section 3.3.3, same address |
| The semantic identifier of IDTA-02035-3 | `urn:samm:io.admin-shell.idta.batterypass.carbon_footprint:1.0.0#CarbonFootprint` | `urn:samm:io.admin-shell.idta.batterypass.carbon_footprint:1.0.0#CarbonFootprintBattery` | CX-0160 section 3.4.3, same address |
| The semantic identifier of IDTA-02035-6 | `urn:samm:io.admin-shell.idta.batterypass.material_composition:1.0.0#MaterialComposition` | the same identifier | CX-0160 section 3.7.3, same address |
| The semantic identifier of IDTA-02035-7 | `urn:samm:io.admin-shell.idta.batterypass.circularity:1.0.0#Circularity` | the same identifier | CX-0160 section 3.8.3, same address |
| The semantic identifier of SingleLevelBomAsBuilt | `urn:samm:io.catenax.single_level_bom_as_built:3.0.0#SingleLevelBomAsBuilt` | the same identifier in CX-0127 2.0.2 of CX-Titan; CX-0127 3.0.0 of the CX-Neptune preview requires `urn:samm:io.catenax.industry_core.single_level_bom_as_built:4.0.0#SingleLevelBomAsBuilt` and the interpretation of version 3.0.0 | `https://catenax-ev.github.io/docs/standards/CX-0127-IndustryCorePartInstance`; `https://catenax-ev.github.io/docs/next/standards/CX-0127-IndustryCorePartInstance` sections 3.4.4 and 6 |
| The images of the connector | `TCK_IMAGE_CONTROL_PLANE`, `TCK_IMAGE_DATA_PLANE` | `tractusx/edc-controlplane-postgresql-hashicorp-vault:0.13.0` and `tractusx/edc-dataplane-hashicorp-vault:0.13.0`, pushed on 2026-08-27; licence Apache-2.0 | `charts/tractusx-connector/templates/deployment-controlplane.yaml` line 68, `charts/tractusx-connector/templates/deployment-dataplane.yaml` line 69, `charts/tractusx-connector/Chart.yaml` line 49, `LICENSE` |
| The secret store | `TCK_IMAGE_VAULT` | HashiCorp Vault through the Helm chart `vault` 0.28.0 in development mode; the release states neither the image tag nor the licence of the image | `charts/tractusx-connector/Chart.yaml` lines 55 to 58; `charts/tractusx-connector/README.md` lines 377 to 380 |
| The database of the connector | `TCK_IMAGE_POSTGRES` | the official image `postgres` in version 18.0 | `docs/migration/2026_06-Version_0.12.x_0.13.x.md` section 3; `charts/tractusx-connector/README.md` lines 353 and 354 |
| The identity of the connector | `TCK_IMAGE_IDENTITY` | the Decentralized Claims Protocol with an account of DIV, a managed wallet: a client identifier, a client secret, a token address and a DIV address; without a DIV address the control plane uses the standard remote Secure Token Service client of the Eclipse Dataspace Components | `charts/tractusx-connector/README.md` lines 14 to 40 and 321 to 324; `edc-extensions/dcp/tx-dcp-sts-div/src/main/java/org/eclipse/tractusx/edc/iam/dcp/sts/RemoteTokenServiceClientExtension.java` |
| The BPN-DID Resolution Service | `TCK_IMAGE_BPN_DID`, `BPN_DID_RESOLUTION_URL`; the request form is not verified | `GET <directory API>/bpn-directory` answers a gzip-compressed map; the caller presents a Verifiable Presentation in JWT form with a Catena-X Membership Credential as the bearer token of the header `Authorization`; image `tractusx/bdrs-server-memory:0.6.0`, licence Apache-2.0 | CX-0167 1.0.0 section 2.1, `https://catenax-ev.github.io/docs/next/standards/CX-0167-BpnDidResolution`; bpn-did-resolution-service `README.md` lines 32 to 39 and `api/directory-api/src/main/java/org/eclipse/tractusx/bdrs/api/directory/DirectoryApiController.java` line 45 |
| The address of a connector in a DID document | the second step of decision D11 | a service entry of the type `DataService` whose endpoint is the version metadata address `<connector>/.well-known/dspace-version` | CX-0018 4.3.0 section 2.6, `https://catenax-ev.github.io/docs/next/standards/CX-0018-DataspaceConnectivity` |
| The Digital Twin Registry | `TCK_IMAGE_DTR`, `DTR_URL`; the path prefix is not verified | `tractusx/sldt-digital-twin-registry:0.13.0`, pushed on 2026-09-01, licence Apache-2.0; the path prefix `/api/v3` with `/shell-descriptors` and `/shell-descriptors/{aasIdentifier}`; OAuth2 authentication is active by default | sldt-digital-twin-registry `backend/src/main/resources/static/aas-registry-openapi.yaml` lines 38, 60 and 196; `INSTALL.md` lines 28 and 38 |

### The findings

1. The BPN-DID Resolution Service answers only a caller that presents a Membership Credential (CX-0167 1.0.0 section 2.1). The receiver resolver `createDidReceiverResolver({ config, fetch })` of section 9.2.5 holds no credential, the configuration of section 9.6 names none, and decision D41 (Authentication without an identity provider) rejected a wallet client in the server. The claim of section 10.7 on the request form therefore proves wrong, and section 11 of the implementation plan stops the phase.
2. Tractus-X EDC 0.13.0 documents the identity of a connector only through an account of DIV, a managed wallet of an operator. The local dataspace that the release documentation recommends (MXD of `eclipse-tractusx/tutorial-resources`) uses the connector chart 0.9.0 and identity images that the user builds from source. The release names no public identity image for a local deployment.
3. The `dct:type` of a submodel offer is `cx-taxo:BatteryPass` with the version `1.0`, and not `cx-taxo:Submodel` without a version.
4. The semantic identifier of IDTA-02035-3 ends with `#CarbonFootprintBattery`, and not with `#CarbonFootprint`.
5. A Catena-X usage policy holds the constraint `FrameworkAgreement` beside the constraint `UsagePurpose`. The offer contract of section 9.2.5 carries no framework agreement.
6. The Digital Twin Registry 0.13.0 activates OAuth2 by default. The configuration of section 9.6 names no credential of the registry.
7. `server/Dockerfile` of section 7 copies `models/` but not `docs/api/aspects/`, and the server reads `docs/api/aspects/BatteryPassportAccessMap-schema.json` at run time.

Version 12 of the implementation plan closes the seven findings: finding 1 by decision D75 (The receiver resolution through the own connector), finding 2 by decision D76 (The wallet stub as the local identity), finding 6 by decision D77 (OAuth2 off in the local registry), and the findings 3, 4, 5 and 7 by corrections of the code, which the second part of phase P7 applied.

### The five values that the first run confirms

| Value | Confirmed value | Public address |
|---|---|---|
| The request and the answer of the connector discovery (D75) | `POST <EDC_MANAGEMENT_URL>/v3/connectordiscovery/connectors` with the body `{ "@context": { "tx": "https://w3id.org/tractusx/v0.0.1/ns/", "edc": "https://w3id.org/edc/v0.0.1/ns/" }, "@type": "tx:ConnectorServiceDiscoveryRequest", "edc:counterPartyId": <identifier> }`; the answer 200 is an array of objects with `edc:counterPartyId`, `edc:counterPartyAddress` and `edc:protocol`; the identifier may be a Business Partner Number, which the connector translates with the BPN-DID Resolution Service | tractusx-edc at the tag `0.13.0`, `docs/usage/management-api-walkthrough/04_catalog.md` lines 29 to 44 (request), lines 64 to 81 (answer) and lines 86 to 90 (the Business Partner Number) |
| The value of the constraint `FrameworkAgreement` | `DataExchangeGovernance:1.0`, with the operator `eq`, beside `UsagePurpose` with `isAnyOf` in one `and` conjunction | `02_policies.md` line 99 and lines 235 to 265 |
| The image and the licence of the secret store | `hashicorp/vault:1.16.1`, the default image of the Helm chart `vault` 0.28.0; licence Business Source License 1.1 (BUSL-1.1), which is not an open source licence of the list of section 9.8 | `hashicorp/vault-helm` at the tag `v0.28.0`, `values.yaml` lines 379 and 380, `Chart.yaml` line 7; `hashicorp/vault` at the tag `v1.16.1`, `LICENSE` lines 1 and 2 |
| The setting that switches OAuth2 off in the registry (D77) | the chart value `registry.authentication` `false`, which starts the registry with the argument `--spring.profiles.active=local`; the profile `local` names an H2 database, whose driver the image does not hold, so the deployment sets a PostgreSQL datasource; the registry shows a shell only to the owning tenant `registry.idm.owningTenantId`, which a reader names in the header `Edc-Bpn` | sldt-digital-twin-registry at the tag `v0.13.0`, `INSTALL.md` lines 28 and 38, `charts/registry/templates/registry/registry-deployment.yaml` lines 45 to 47, `backend/src/main/resources/application-local.yml` lines 1 to 40, `docs/guideline-edc-extension-configuration.md` line 17 |
| The work of the wallet stub with the connectors of release 0.13.0 (D76) | not confirmed: the record below | `eclipse-tractusx/ssi-dim-wallet-stub` at the tag `0.1.0` (commit `6734a1fe38c78b343799d7407ef318b6cd0c11de`) |

### The first run of phase P7

The first run on 2026-11-19 started the deployment of `docker-compose.yml` with the images of `.env.example`. Every service reached the state healthy. The run then found three results.

1. **Three wallet stubs refuse each other.** The catalog request of the connector of participant 2 to the connector of participant 1 answered 502 with the provider answer `{"@type":"CatalogError","code":"401","reason":["Unauthorized"]}`. The stub of participant 1 logged `Internal Error: I/O error on GET request for "https://stub-1%253A8080/BPNL00000000TCK1/did.json"`. The stub resolves the DID of another host only over https (`impl/src/main/java/org/eclipse/tractusx/wallet/stub/token/impl/TokenServiceImpl.java` lines 174 to 210 at the tag `0.1.0`), and the local deployment serves no https.
2. **One shared wallet stub serves the identity.** A diagnostic run outside the files of the repository gave the connectors of participants 1 and 2 one stub, as the Tractus-X umbrella 3.9.0 gives all its connectors one stub. Then the catalog request answered 200, the negotiation reached `FINALIZED`, the transfer `HttpData-PULL` reached `STARTED`, and the endpoint data reference named the provider data plane. A GET and a POST through the data plane reached the backend with the header `edc-bpn` equal to `BPNL00000000TCK2`, the consumer, although the consumer had set `Edc-Bpn: BPNL00000000TCK6` itself, and with the provider's data plane key, although the consumer had set its own `x-api-key`. The four modules of phase P7 worked in that run: the offer store published, listed and withdrew offers, the transport sent a notification (outcome `sent`) and pulled an offer (outcome `received`), a hidden offer gave `no_asset`, and the registry client registered, replaced and read a shell.
3. **The connector discovery of D75 finds no connector.** The DID document of the stub holds the service entries `CredentialService` and `IssuerService` and no entry of the type `DataService`. The connector registers its entry through DIV with `GET /api/v2.0.0/companyIdentities?$filter=issuerDID eq "<did>"`, and the stub answers 404, because the stub has no such endpoint. The discovery request therefore answers 400 `No connector endpoints found for counterPartyId did:web:stub-1%3A8080:BPNL00000000TCK1`, and the resolver of D75 resolves every receiver to `null`.

Decision D76 makes the implementer report the failure to the owner before the contingency applies, so `lib/connectorBinding.mjs` refuses to start, and the sixteen files do not run on the connector binding.

### The second run of phase P7

The second run on 2026-11-19 followed version 13 of the implementation plan: one wallet stub (decision D80), the address list resolver (decision D81) and the connector binding on a started deployment (decision D84). Each of the three regimes ran on a fresh deployment, and `docker compose up -d --wait` exited 0 for each. The run found three results.

1. **The provider data plane answers 500 to a refusal of the server.** Tractus-X EDC 0.13.0 passes an answer 200 of the server through unchanged. The data plane answers every other status of the server with 500 and without the error body of the server: a GET of a receiving endpoint, which the server answers with 405 `ERR-RX-METHOD-NOT-ALLOWED`, gave 500 `{"errors":["Received code transferring HTTP data: 405 - Method Not Allowed."]}`, and an unknown operation, which the server answers with 404 `ERR-RX-OPERATION-UNKNOWN`, gave 500 `{"errors":[]}`. The data plane logged `ERROR [DataPlanePublicApiV2Controller] Failed to read data from source: NOT_FOUND`. The sender therefore records a refused notification as a failed transport and repeats the notification every 60 seconds (decision D49), and the descriptive error body of section 4.3 item 7 of the proposal does not reach the sender.
2. **One repeated notification fails `settle()` of every file of a run.** The refused BatteryRepaired of `CAC-012.tck.mjs` for the passport `TCK-PASSPORT-UNKNOWN` stayed pending, and `settle()` of every file of the default run then failed with `settle: recycler holds the pending notification <messageId>`, because the files of a run share one deployment and `settle()` polls every sent record of the three servers. The refused BatteryBecameWaste after a PassportEnded of `CAC-009.tck.mjs` failed `settle()` of that run in the same way. The header test `connectorHeader.test.mjs` received 500 in place of 404 for the same reason; the first run had observed the replacement of the header `Edc-Bpn` with an echo backend.
3. **One assertion needs a fixed clock.** `CAC-009.tck.mjs` asserts that a PassportEnded planned before a BatteryBecameWaste leaves at least 5 seconds after the BatteryBecameWaste. The servers of the deployment run on the real clock, and the second request is planned some milliseconds after the first, so the difference is below 5 seconds.

| Criterion | Pass count in-process | Pass count across connectors |
|---|---|---|
| CX-0160-4-CAC-001 (New passport) | 7 of 7 | 4 of 7 |
| CX-0160-4-CAC-002 (Digital twin) | 5 of 5 | 0 of 1 |
| CX-0160-4-CAC-003 (Model elements) | 6 of 6 | 6 of 6 |
| CX-0160-4-CAC-004 (Predecessor links) | 3 of 3 | 3 of 3 |
| CX-0160-4-CAC-005 (Forward link) | 7 of 7 | 0 of 1 |
| CX-0160-4-CAC-006 (Status and repair) | 11 of 11 | 5 of 11 |
| CX-0160-4-CAC-007 (Waste status) | 7 of 7 | 3 of 7 |
| CX-0160-4-CAC-008 (Donors) | 3 of 3 | 0 of 1 |
| CX-0160-4-CAC-009 (End of the passport) | 7 of 7 | 4 of 7 |
| CX-0160-4-CAC-010 (Access) | 7 of 7 | 7 of 7 |
| CX-0160-4-CAC-011 (Access before the Art. 77(9) act) | 4 of 4 | 4 of 4 |
| CX-0160-4-CAC-012 (Notification API) | 9 of 9 | 0 of 1 |
| CX-0160-4-CAC-013 (Data assets) | 5 of 5 | 2 of 5 |
| CX-0160-4-CAC-014 (Certificates) | 3 of 3 | 0 of 3 |
| CX-0160-4-CAC-015 (Persistence) | 4 of 4 | 0 of 1 |
| CX-0160-4-CAC-016 (Access map) | 6 of 6 | 6 of 6 |

A count "0 of 1" names a file whose test failed before its subtests ran. Every failure across connectors of the default run is the failure of `settle()` of result 2. The owner decides results 1 to 3.

### The recorded answers of phase P7

The contract tests of the server use these answer forms, recorded on 2026-11-19 against the images of `.env.example`.

| Request | Answer |
|---|---|
| `POST /v3/connectordiscovery/connectors` for a Business Partner Number without a DID | 400 `[{"message":"No did found for identifier BPNL00000000TCK4","type":"InvalidRequest","path":null,"invalidValue":null}]` |
| the same for a DID document without a connector | 400 `[{"message":"No connector endpoints found for counterPartyId <did>","type":"InvalidRequest",...}]` |
| `POST /v3/policydefinitions` with `isAnyOf` and an empty list | 400 `mandatory value 'http://www.w3.org/ns/odrl/2/rightOperand' is missing or it is blank` |
| `PUT /v3/policydefinitions/<id>` of a policy that a contract definition references | 400 `Policy Definition is referenced by a Contract Definition` |
| `POST /v3/catalog/request` | 200, a `Catalog` with `participantId` and a list `dataset`, each with `@id`, `dct:type` as `{ "@id": <full address> }`, the other properties under their full addresses and `hasPolicy` |
| `GET /v3/contractnegotiations/<id>` | 200 with `state` (`REQUESTED`, `AGREED`, `VERIFIED`, `FINALIZED` or `TERMINATED`) and `contractAgreementId` |
| `GET /v3/edrs/<transfer id>/dataaddress` | 200 with `endpoint` and `authorization` |
| `PUT /api/v3/shell-descriptors/<base64url id>` of the registry | 201 for a new shell, 204 for a registered shell |
| `GET /api/v3/shell-descriptors/<base64url id>` | 200 to the owning tenant in the header `Edc-Bpn`; 404 `{"messages":[{"messageType":"Error","text":"Shell for identifier <id> not found"}]}` otherwise |

## NOTICE

This work is licensed under the [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/legalcode).

- SPDX-License-Identifier: CC-BY-4.0
- SPDX-FileCopyrightText: 2026 Ichnos Protocol Pte. Ltd.
- SPDX-FileCopyrightText: 2026 Contributors to the Eclipse Foundation
- Source URL: https://github.com/Ichnos-Protocol/battery-passport-after-first-life/blob/main/tck/README.md
