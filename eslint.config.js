// SPDX-FileCopyrightText: 2026 Alex Brandt <alunduil@gmail.com>
// SPDX-License-Identifier: MIT

import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

/** Files carrying TypeScript, and so the type-aware rules. */
const TYPESCRIPT_FILES = ['**/*.ts'];

export default defineConfig([
  // `dist/` is the generated bundle, reviewed as a diff rather than linted.
  globalIgnores(['dist', 'node_modules', 'coverage', 'test-results']),
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: TYPESCRIPT_FILES,
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        // Resolves each file's program the way tsserver does, so
        // `scripts/` reaches tsconfig.scripts.json without listing projects.
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
]);
