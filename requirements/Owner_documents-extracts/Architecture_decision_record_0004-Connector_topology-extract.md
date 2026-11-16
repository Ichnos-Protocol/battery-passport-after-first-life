# Extract: Architecture decision record 0004: connector topology

Extract of architecture decision record 0004 of the battery passport application ("connector topology, a per-customer stack run by Ichnos", accepted on 2026-09-27), a document of the owner of this repository. The extract holds only the passages that the requirements of this repository quote.

## 1 Context

> Every exchange with another company passes through the connector

## 2 Decision, item 1

> Ichnos runs one stack per customer company (connector, twin registry, wallet), and the application uses it on the customer's behalf (option C)

## Section 2, decision 1

> Ichnos runs one stack per customer company (connector, twin registry, wallet), and the application uses it on the customer's behalf (option C).

## Section 2, decision 2

> In production the stack is an Enablement Service Provider capability. Ichnos is assessed

## Section 2, decision 3

> The stacks are isolated from each other: each has its own database, keys, secrets, DID and credentials.

## Section 2, decision 6

> The binding between a tenant and its stack is a database row, never a code edit.

## Status

> Accepted (2026-09-27, Francesco).

## NOTICE

This work is licensed under the [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/legalcode).

- SPDX-License-Identifier: CC-BY-4.0
- SPDX-FileCopyrightText: 2026 Ichnos Protocol Pte. Ltd.
- SPDX-FileCopyrightText: 2026 Contributors to the Eclipse Foundation
- Source URL: https://github.com/Ichnos-Protocol/battery-passport-after-first-life/blob/main/requirements/Owner_documents-extracts/Architecture_decision_record_0004-Connector_topology-extract.md
