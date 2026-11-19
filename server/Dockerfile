################################################################################
# Copyright (c) 2026 Ichnos Protocol Pte. Ltd.
# Copyright (c) 2026 Contributors to the Eclipse Foundation
#
# See the NOTICE file(s) distributed with this work for additional
# information regarding copyright ownership.
#
# This program and the accompanying materials are made available under the
# terms of the Apache License, Version 2.0 which is available at
# https://www.apache.org/licenses/LICENSE-2.0.
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations
# under the License.
#
# SPDX-License-Identifier: Apache-2.0
################################################################################

# The image of the reference server for the connector binding of the conformance test kit (section 7
# and section 10.7 of docs/architecture/implementation_plan.md). The build context is the repository
# root. The server reads docs/api/schemas/, docs/api/aspects/ and sources/IDTA/ at run time (finding 7
# of the verification of phase P7).
FROM node:24

WORKDIR /app
COPY server/ server/
COPY docs/api/schemas/ docs/api/schemas/
COPY docs/api/aspects/ docs/api/aspects/
COPY models/ models/
COPY sources/IDTA/ sources/IDTA/
RUN cd server && npm ci --omit=dev

WORKDIR /app/server
CMD ["node", "src/index.mjs"]
