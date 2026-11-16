#!/usr/bin/env bash
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

# Validates the three proposed aspect models with the SAMM command line tool 2.11.1.
# With the argument --generate the script also writes the JSON schema of each model to docs/api/aspects.
# The file has LF line endings, which the file .gitattributes of the repository root sets for every shell script.
# The script runs at the repository root, in a shell with Java 21.
set -euo pipefail

JAR="tools/samm-cli-2.11.1.jar"
JAR_SHA256="fab66a72e1969ff2e4d9db5d1c0eeb55936f89e2159045576301ea46c49ffc0f"
ROOT="tools/models-root"
SHARED="sources/Tractus-X/semantic-models"
GENERATED="docs/api/aspects"
MODELS=(
  "io.catenax.battery.passport_lifecycle:BatteryPassportLifecycle"
  "io.catenax.battery.passport_successors:BatteryPassportSuccessors"
  "io.catenax.battery.passport_access_map:BatteryPassportAccessMap"
)

if [ ! -f "$JAR" ]; then
  echo "MISSING $JAR"
  exit 1
fi
if ! echo "$JAR_SHA256  $JAR" | sha256sum -c --quiet -; then
  echo "CHECKSUM $JAR"
  exit 1
fi

# The tool resolves an imported model from the folder layout <root>/<namespace>/<version>/<File>.ttl
# around the input file, so the script assembles one models root with the five namespaces.
rm -rf "$ROOT"
mkdir -p "$ROOT"
cp -r "$SHARED/io.catenax.shared.uuid" "$ROOT/"
cp -r "$SHARED/io.catenax.shared.business_partner_number" "$ROOT/"
for entry in "${MODELS[@]}"; do
  namespace="${entry%%:*}"
  aspect="${entry##*:}"
  mkdir -p "$ROOT/$namespace/1.0.0"
  cp "models/$namespace/1.0.0/$aspect.ttl" "$ROOT/$namespace/1.0.0/$aspect.ttl"
done

failed=0
for entry in "${MODELS[@]}"; do
  namespace="${entry%%:*}"
  aspect="${entry##*:}"
  log="$ROOT/$aspect.validate.log"
  if java -jar "$JAR" aspect "$ROOT/$namespace/1.0.0/$aspect.ttl" validate > "$log" 2>&1 && grep -q "Input model is valid" "$log"; then
    echo "VALID $aspect"
  else
    echo "FAILED $aspect"
    cat "$log"
    failed=1
  fi
done
if [ "$failed" -ne 0 ]; then
  exit 1
fi

if [ "${1:-}" = "--generate" ]; then
  for entry in "${MODELS[@]}"; do
    namespace="${entry%%:*}"
    aspect="${entry##*:}"
    mkdir -p "$GENERATED"
    java -jar "$JAR" aspect "$ROOT/$namespace/1.0.0/$aspect.ttl" to schema > "$GENERATED/$aspect-schema.json"
    echo "GENERATED $aspect"
  done
fi
