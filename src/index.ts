// SPDX-FileCopyrightText: 2026 Alex Brandt <alunduil@gmail.com>
// SPDX-License-Identifier: MIT

import * as core from '@actions/core';

import { describeError, run } from './main.js';

// Separate from `main.ts` so the run logic is importable by tests without the
// top-level await that starts it.
try {
  await run();
} catch (error) {
  core.setFailed(describeError(error));
}
