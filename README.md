<!--
SPDX-FileCopyrightText: 2026 Alex Brandt <alunduil@gmail.com>
SPDX-License-Identifier: MIT
-->

# projects-v2-sync

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![REUSE status](https://img.shields.io/reuse/compliance/github.com/alunduil/projects-v2-sync?style=flat-square)](https://api.reuse.software/info/github.com/alunduil/projects-v2-sync)

Mirror issues and pull requests onto a GitHub Projects v2 board from a
declarative in/out spec.

**By [Alex Brandt](https://github.com/alunduil)**

🚧 **Scaffold**: the action loads, validates its spec, and exits. The spec
format is [#2](https://github.com/alunduil/projects-v2-sync/issues/2) and the
reconciler is [#3](https://github.com/alunduil/projects-v2-sync/issues/3);
until those land it changes nothing on a board.

## What this action does

A Projects v2 board that collects work from several repositories has to be
filled by something. GitHub's built-in "item added" workflow can't tell a pull
request from an issue, so everything lands in one column and drifts from there.

This action reads a spec naming the board, the searches that feed it, and the
fields to stamp, then reconciles the board against them — adding new items,
correcting drifted field values, and leaving everything else alone. A clean
re-run makes no writes.

The spec carries no field or option IDs. Names resolve at runtime, so renaming
a column in the UI doesn't strand the sync on a stale ID.

## Usage

```yaml
- uses: alunduil/projects-v2-sync@v1
  with:
    spec: github/projects/inbox.json
    token: ${{ secrets.GH_PROJECT_SYNC_TOKEN }}
```

### Inputs

| Input   | Required | Description                                               |
| ------- | -------- | --------------------------------------------------------- |
| `spec`  | yes      | Path to the sync spec, relative to the workspace root.    |
| `token` | yes      | Token authorised to read the sources and write the board. |

`GITHUB_TOKEN` can't write a user-owned project, which is why the token is a
required input rather than an optional override.

## Contributing

Requires Node.js (see [`.nvmrc`](.nvmrc)) and pnpm. Run `corepack enable` once,
then:

```console
pnpm install
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
```

`dist/` is committed: a Node action runs the checked-in bundle, with no install
step on the runner. Rebuild and commit it in the same change as any source
edit — CI fails when the two disagree.

`pre-commit run --all-files` gates every pull request. The authoritative hook
list is [`.pre-commit-config.yaml`](.pre-commit-config.yaml).

## License

[MIT](LICENSE). This repository follows [REUSE](https://reuse.software) — every
file carries its copyright and licence, inline or through
[`REUSE.toml`](REUSE.toml).
