<!--
SPDX-FileCopyrightText: 2026 Alex Brandt <alunduil@gmail.com>
SPDX-License-Identifier: MIT
-->

# Agent instructions for projects-v2-sync

Rules a session can't work out from the files. Contributor setup is in the
[README](README.md); comments in the config files explain the rest.

Keep this filename: it's the path coding agents look for. Claude Code reads
[`CLAUDE.md`](CLAUDE.md), which imports this file.

## Repository settings

- Repository settings, rulesets, and branch protection are managed in
  alunduil/alunduil-infrastructure's Terraform. Change only code here; when a
  task needs a settings change, file an issue there and link it from the pull
  request.
- That ruleset requires status checks by job `name:`. Renaming a job in a
  workflow drops its required check until the ruleset matches, so pair a
  rename with an alunduil-infrastructure issue.

## Running checks

- Run Vale through the hook: `prek run vale --all-files`. Plain `vale .` has
  no directory ignore and lints `node_modules/` and the vendored styles.
