---
title: "Iam account orchestration"
description: "`iamCreateAccount` and `iamUpdateAccountById` now orchestrate uniqueness checks, server-side derived fields, tenant expansion, no-privilege-escalation, and coordinated IamUser writes."
date: 2026-05-10
version: "Unreleased"
classification: feature
source_commit: "b9e2580ad11e2388bd4cdecc55ca79cf4a9b51a9"
source_archive_url: "https://github.com/avvale/aurora-catalyst/tree/b9e2580ad11e2388bd4cdecc55ca79cf4a9b51a9/openspec/changes/archive/2026-05-10-add-iam-account-create-orchestration/"
---

> Auto-generated from the source archive. Do not edit by hand — rerun `catalyst-changelog-sync` instead.

## What changed

- `IamCreateAccountHandler` and `IamUpdateAccountByIdHandler` are rewritten as orchestrators. They validate uniqueness of `email`, `username`, and `code` pre-INSERT and raise a localized `ConflictException` (`iam.error.uniqueEmail` / `uniqueUsername` / `uniqueCode`) instead of letting the database fail with a cryptic error.
- The denormalized columns `dApplicationCodes` and `dPermissions` are now derived server-side from `client.applications` and `roles.permissions` via the new `iamCreatePermissionsFromRoles` helper. Any values supplied by the client for these fields are overwritten — the server is the source of truth.
- New no-escalation rule: a caller without `IamPermissions.SUDO` can only assign permissions it already owns, otherwise a 401 `ConflictException` (`iam.error.insufficientPermissions`) is raised. `hasAddChildTenants: true` expands `tenantIds` with descendants from the tenant tree.
- When `payload.type === 'USER'`, the handler invokes `IamCreateUserService.main` (and `IamUpdateUserByIdService.main` on update) inside the same coordinated operation, sharing an `operationId` for a coherent audit trail. An empty `password` on update is dropped from the user payload so passwords are never silently overwritten.

## Why it matters

Before this change, `IamCreateAccountHandler` was a thin pass-through to `repository.create(payload)`. The nested `user` block was silently ignored, the two derived columns had to be invented by the frontend (with the risk of authorization inconsistencies), uniqueness failed at the DB layer with non-localized errors, and any authenticated caller with `iam.account.create` could escalate privileges by assigning roles it did not own. The new orchestration ports the ~225-line Aurora monolith reference (`create-account.function.ts`) onto catalyst's canonical pattern — handler orchestrates injected services directly, no `CommandBus`/`QueryBus` indirection — and unblocks the rich `iam/account` form in the dependent frontend change. Every catalyst-scaffolded project now ships with a correct iam orchestration end to end.

---

[View original proposal](https://github.com/avvale/aurora-catalyst/tree/b9e2580ad11e2388bd4cdecc55ca79cf4a9b51a9/openspec/changes/archive/2026-05-10-add-iam-account-create-orchestration/)
