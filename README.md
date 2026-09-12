<!--
SPDX-FileCopyrightText: 2026 Alex Brandt <alunduil@gmail.com>
SPDX-License-Identifier: MIT
-->

# projects-v2-sync

[![License](https://img.shields.io/github/license/alunduil/projects-v2-sync?style=flat-square)](LICENSE)
[![REUSE status](https://img.shields.io/reuse/compliance/github.com/alunduil/projects-v2-sync?style=flat-square)](https://api.reuse.software/info/github.com/alunduil/projects-v2-sync)

Sync issues and pull requests onto a GitHub Projects v2 board from a
declarative spec.

**By [Alex Brandt](https://github.com/alunduil)** ·
[Repository](https://github.com/alunduil/projects-v2-sync)

🚧 **Scaffold**: the action loads its spec, validates it, and exits without
touching a board. The spec format is
[#2](https://github.com/alunduil/projects-v2-sync/issues/2); the reconciler is
[#3](https://github.com/alunduil/projects-v2-sync/issues/3).

## What this action does

GitHub's built-in "item added" workflow can't tell a pull request from an
issue, so everything lands in one column and drifts from there.

This action reads a spec naming the board, the searches that feed it, and the
fields to write. It then reconciles the board against the spec: adding items
the searches found, correcting field values that have drifted, and leaving
everything else alone. A clean re-run makes no writes.

The spec carries no field or option IDs. Names resolve at runtime, so renaming
a column in the UI doesn't strand the sync on a stale ID.

## Before you start

You need a Projects v2 board, a spec file committed to the repository running
the workflow, and a token.

`GITHUB_TOKEN` won't do: it can't write a user-owned project. Create a classic
personal access token with `project` (write board items), `repo` (read issues
and pull requests across the sources, private ones included), and `read:org`
(resolve organisation-owned sources), then store it as a repository or
environment secret.

## Usage

The spec is read from the workspace, so the workflow has to check out the
repository first.

```yaml
name: sync-project

on:
  schedule:
    - cron: '0 * * * *'
  workflow_dispatch:

permissions:
  contents: read

jobs:
  inbox:
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - uses: actions/checkout@v6

      - uses: alunduil/projects-v2-sync@v1
        with:
          spec: github/projects/inbox.json
          token: ${{ secrets.GH_PROJECT_SYNC_TOKEN }}
```

### Inputs

| Input   | Required | Description                                                                 |
| ------- | -------- | --------------------------------------------------------------------------- |
| `spec`  | yes      | Path to the sync spec. A relative path resolves against the workspace root. |
| `token` | yes      | Token authorised to read the sources and write the board.                   |

This action sets no outputs.

## Getting help

Open an [issue](https://github.com/alunduil/projects-v2-sync/issues). Bug
reports are more useful with the workflow run's log and the spec that produced
it.

## Contributing

Pull requests are welcome. Subjects follow
[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

Requires Node.js (see [`.nvmrc`](.nvmrc)) and pnpm. Run `corepack enable` once,
then:

```console
pnpm install
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
```

`pre-commit run --all-files` gates every pull request. The authoritative hook
list is [`.pre-commit-config.yaml`](.pre-commit-config.yaml).

`dist/` is committed, because a Node action runs the checked-in bundle with no
install step on the runner. Rebuild and commit it in the same change as any
source edit — CI fails when the two disagree.

## License

[MIT](LICENSE). This repository follows [REUSE](https://reuse.software) — every
file carries its copyright and licence, inline or through
[`REUSE.toml`](REUSE.toml).
