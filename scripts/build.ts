// SPDX-FileCopyrightText: 2026 Alex Brandt <alunduil@gmail.com>
// SPDX-License-Identifier: MIT

import { build } from 'esbuild';

/**
 * Matches `runs.using` in action.yml. Raising one without the other either
 * wastes the runtime's features or emits syntax it cannot parse.
 */
const RUNTIME = 'node24';

/**
 * Gives esbuild's `__require` shim something to delegate to.
 *
 * `@actions/core` is ESM, but its dependency chain still reaches CommonJS
 * packages — `tunnel`, via the HTTP client — that call `require` for Node
 * builtins. Bundled into ESM those become the shim, which throws
 * `Dynamic require of "net" is not supported` at load.
 */
const CJS_INTEROP_BANNER = [
  "import { createRequire as __createRequire } from 'node:module';",
  'const require = __createRequire(import.meta.url);',
].join('\n');

// The runner executes `runs.main` with no install step, so every import has to
// be inlined and nothing can be marked external.
await build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.js',
  bundle: true,
  platform: 'node',
  target: RUNTIME,
  format: 'esm',
  banner: { js: CJS_INTEROP_BANNER },
  sourcemap: false,
  // The bundle is reviewed as a diff on every dependency bump. Minifying would
  // make that diff unreadable for no runtime gain: the runner reads it from
  // local disk.
  minify: false,
  logLevel: 'info',
});
