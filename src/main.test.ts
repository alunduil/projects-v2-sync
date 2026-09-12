// SPDX-FileCopyrightText: 2026 Alex Brandt <alunduil@gmail.com>
// SPDX-License-Identifier: MIT

import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { resolveSpecPath, run } from './main.js';

/** Writes `contents` to a spec file in a fresh temporary directory. */
async function specFile(contents: string): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), 'projects-v2-sync-'));
  const path = join(directory, 'spec.json');
  await writeFile(path, contents, 'utf8');

  return path;
}

/**
 * Points the action's inputs at `spec`. `core.getInput` reads `INPUT_*`, and
 * uppercases the name after replacing spaces, so these are the names it looks
 * for.
 */
function setInputs(spec: string): void {
  process.env['INPUT_SPEC'] = spec;
  process.env['INPUT_TOKEN'] = 'not-a-real-token';
}

afterEach(() => {
  delete process.env['INPUT_SPEC'];
  delete process.env['INPUT_TOKEN'];
  delete process.env['GITHUB_WORKSPACE'];
});

describe('resolveSpecPath', () => {
  it('resolves a relative spec against the workspace', () => {
    expect(resolveSpecPath('github/projects/inbox.json', '/workspace')).toBe(
      '/workspace/github/projects/inbox.json',
    );
  });

  it('returns an absolute spec unchanged', () => {
    expect(resolveSpecPath('/etc/inbox.json', '/workspace')).toBe('/etc/inbox.json');
  });

  it('falls back to the working directory when the workspace is unset', () => {
    expect(resolveSpecPath('inbox.json', undefined)).toBe(join(process.cwd(), 'inbox.json'));
  });
});

describe('run', () => {
  it('accepts a spec that parses as a JSON object', async () => {
    setInputs(await specFile('{"owner": "alunduil", "title": "Inbox"}'));

    await expect(run()).resolves.toBeUndefined();
  });

  it('rejects a spec whose top level is not an object', async () => {
    setInputs(await specFile('["inbox"]'));

    await expect(run()).rejects.toThrow(/not a JSON object/);
  });

  it('reports the path when the spec is missing', async () => {
    setInputs('/nonexistent/spec.json');

    await expect(run()).rejects.toThrow(/\/nonexistent\/spec\.json/);
  });
});
