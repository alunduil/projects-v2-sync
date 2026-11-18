<!--
SPDX-FileCopyrightText: 2026 Alex Brandt <alunduil@gmail.com>
SPDX-License-Identifier: MIT
-->

# Agent instructions for projects-v2-sync

Add a rule here only when the repository's files don't already state it. Keep
this filename: coding agents look for it, and [`CLAUDE.md`](CLAUDE.md) imports
it.

When a task needs a change to repository settings, rulesets, or branch
protection, file an issue on alunduil/alunduil-infrastructure, whose Terraform
manages them, and link it from the pull request. Renaming a workflow job also
needs that issue: the ruleset requires checks by job `name:`, and a check
under the old name never reports, which blocks merging.
