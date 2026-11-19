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

// Requirement: SwR-ACCESS-088 (Passport dataset writes only by the responsible or authorised
// operator), with decision D41 (Authentication without an identity provider). Section 9.2.3 of
// docs/architecture/implementation_plan.md.
// The command "npm run sign-token" of the administrator of a deployment (EL-ACCESS, the access
// control): "npm run sign-token -- <sub> <bpnl> [<seconds>]" prints one operator token. The command
// reads the key OPERATOR_TOKEN_SECRET from the environment. The claim sub names a system or a role of
// the operator and never a person; the lifetime is 3600 seconds or less and defaults to 3600 seconds.
import { MAXIMUM_LIFETIME_SECONDS, signOperatorToken } from "./operatorToken.mjs";

const secret = process.env.OPERATOR_TOKEN_SECRET;
const [sub, bpnl, lifetime] = process.argv.slice(2);
if (!secret || !sub || !bpnl) {
  process.stderr.write("The command sign-token needs the variable OPERATOR_TOKEN_SECRET and the arguments <sub> <bpnl> [<seconds>].\n");
  process.exit(1);
}
const expiresInSeconds = lifetime === undefined ? MAXIMUM_LIFETIME_SECONDS : Number(lifetime);
try {
  process.stdout.write(`${signOperatorToken({ sub, bpnl, expiresInSeconds }, { secret, now: new Date() })}\n`);
} catch (error) {
  process.stderr.write(`The token was not signed: ${error.message}\n`);
  process.exit(1);
}
