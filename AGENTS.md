<!--
SPDX-FileCopyrightText: 2026 Alex Brandt <alunduil@gmail.com>
SPDX-License-Identifier: MIT
-->

# Agent instructions for projects-v2-sync

Rules a session can't work out from the files. Contributor setup is in the
[README](README.md); comments in the config files explain the rest.

Keep this filename: coding agents look for it, and [`CLAUDE.md`](CLAUDE.md)
imports it.

Repository settings, rulesets, and branch protection are managed in
alunduil/alunduil-infrastructure's Terraform. Change only code here; when a
task needs a settings change, file an issue there and link it from the pull
request. Renaming a workflow job is one: the ruleset requires status checks by
job `name:`, so a rename drops the check until the ruleset matches.
