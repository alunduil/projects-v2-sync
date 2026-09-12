// SPDX-FileCopyrightText: 2026 Alex Brandt <alunduil@gmail.com>
// SPDX-License-Identifier: MIT

import { build } from 'esbuild';

// A Node action runs the checked-in bundle: the runner clones the repository
// at the referenced ref and executes `runs.main` directly, with no install
// step. Everything imported has to be inlined, which is why `dist/` is
// committed and why `packages` is left at its bundling default rather than
// marking dependencies external.
await build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.js',
  bundle: true,
  platform: 'node',
  // Matches `runs.using: node24` in action.yml. Raising one without the other
  // either wastes the runtime's features or emits syntax it cannot parse.
  target: 'node24',
  format: 'esm',
  // @actions/core is ESM, but its dependency chain still reaches CommonJS
  // packages (tunnel, via the HTTP client) that call `require` for Node
  // builtins. Bundling those into ESM leaves esbuild's `__require` shim,
  // which throws "Dynamic require of \"net\" is not supported" at load.
  // Defining a real `require` gives the shim something to delegate to.
  banner: {
    js: [
      "import { createRequire as __createRequire } from 'node:module';",
      'const require = __createRequire(import.meta.url);',
    ].join('\n'),
  },
  sourcemap: false,
  // The bundle is a build artifact reviewed as a diff on every dependency
  // bump. Minifying would make that diff unreadable for no runtime gain —
  // the runner reads it from local disk, not over a network.
  minify: false,
  logLevel: 'info',
});
