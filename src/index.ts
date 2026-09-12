// SPDX-FileCopyrightText: 2026 Alex Brandt <alunduil@gmail.com>
// SPDX-License-Identifier: MIT

import * as core from '@actions/core';

import { run } from './main.js';

// The bundle's entry. Kept separate from `main.ts` so the run logic is
// importable by tests without the top-level await that starts it.
try {
  await run();
} catch (error) {
  // `setFailed` stringifies whatever it is given, which turns a thrown
  // non-Error into "[object Object]". Naming the two cases keeps an
  // unexpected throw legible in the log.
  core.setFailed(error instanceof Error ? error.message : String(error));
}
