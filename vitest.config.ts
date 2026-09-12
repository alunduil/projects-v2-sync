// SPDX-FileCopyrightText: 2026 Alex Brandt <alunduil@gmail.com>
// SPDX-License-Identifier: MIT

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['dist/**', 'node_modules/**'],
    reporters: ['default', 'junit'],
    outputFile: {
      junit: './test-results/junit.xml',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      // The bundle is generated, and the entry only wires `run` to
      // `setFailed`. Neither carries logic a coverage number describes.
      exclude: ['dist/**', 'scripts/**', 'src/index.ts', '*.config.ts'],
    },
  },
});
