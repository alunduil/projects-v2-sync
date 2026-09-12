// SPDX-FileCopyrightText: 2026 Alex Brandt <alunduil@gmail.com>
// SPDX-License-Identifier: MIT

import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { describeError, isJsonObject, loadSpec, resolveSpecPath, run } from './main.js';

/** A fresh directory per call, so concurrent tests cannot collide. */
async function specFile(contents: string): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), 'projects-v2-sync-'));
  const path = join(directory, 'spec.json');
  await writeFile(path, contents, 'utf8');

  return path;
}

/** `core.getInput` reads `INPUT_*`, uppercased with spaces replaced. */
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

describe('isJsonObject', () => {
  it('accepts an object', () => {
    expect(isJsonObject({ owner: 'alunduil' })).toBe(true);
  });

  // Arrays and `null` pass a bare `typeof` check; the string anchors the
  // other side.
  it.each([
    ['an array', []],
    ['null', null],
    ['a string', 'inbox'],
  ])('rejects %s', (_label, value) => {
    expect(isJsonObject(value)).toBe(false);
  });
});

describe('loadSpec', () => {
  it('returns the parsed spec', async () => {
    const path = await specFile('{"owner": "alunduil", "title": "Inbox"}');

    await expect(loadSpec(path)).resolves.toStrictEqual({
      owner: 'alunduil',
      title: 'Inbox',
    });
  });

  it('rejects a spec whose top level is not an object', async () => {
    const path = await specFile('["inbox"]');

    await expect(loadSpec(path)).rejects.toThrow(/not a JSON object/);
  });

  it('names the path when the spec is missing', async () => {
    await expect(loadSpec('/nonexistent/spec.json')).rejects.toThrow(/\/nonexistent\/spec\.json/);
  });
});

describe('describeError', () => {
  it('uses the message of an Error, without the "Error:" prefix', () => {
    expect(describeError(new Error('spec unreadable'))).toBe('spec unreadable');
  });

  it('passes a thrown string through', () => {
    expect(describeError('spec unreadable')).toBe('spec unreadable');
  });

  // A bare String() would render this "[object Object]" and lose the field.
  it('serialises a thrown object', () => {
    expect(describeError({ code: 'ENOENT' })).toBe('{"code":"ENOENT"}');
  });

  it('falls back rather than throwing on a value it cannot serialise', () => {
    const cyclic: Record<string, unknown> = {};
    cyclic['self'] = cyclic;

    expect(describeError(cyclic)).toBe('[object Object]');
  });
});

describe('run', () => {
  it('completes against a readable spec', async () => {
    setInputs(await specFile('{"owner": "alunduil", "title": "Inbox"}'));

    await expect(run()).resolves.toBeUndefined();
  });

  it('propagates a spec failure to the caller', async () => {
    setInputs('/nonexistent/spec.json');

    await expect(run()).rejects.toThrow(/\/nonexistent\/spec\.json/);
  });
});
