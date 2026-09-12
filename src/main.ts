// SPDX-FileCopyrightText: 2026 Alex Brandt <alunduil@gmail.com>
// SPDX-License-Identifier: MIT

import { readFile } from 'node:fs/promises';
import { isAbsolute, resolve } from 'node:path';

import * as core from '@actions/core';

/**
 * A parsed sync spec.
 *
 * Types only what the loader guarantees. The fields the reconciler reads
 * belong to the spec format.
 */
export type Spec = Record<string, unknown>;

/** The action's inputs, resolved against the runner's workspace. */
export interface Inputs {
  /** Absolute path to the spec file. */
  specPath: string;
  /** Authorised against the board and the source repositories. */
  token: string;
}

/**
 * An action's working directory is the workspace, but a composite or container
 * step can change it, so a relative open is not reliable.
 */
export function resolveSpecPath(spec: string, workspace: string | undefined): string {
  if (isAbsolute(spec)) return spec;

  return resolve(workspace ?? process.cwd(), spec);
}

/**
 * `action.yml` marks both inputs required, which rejects a workflow that omits
 * them. `required: true` here also rejects a blank value.
 */
export function readInputs(): Inputs {
  return {
    specPath: resolveSpecPath(
      core.getInput('spec', { required: true }),
      process.env['GITHUB_WORKSPACE'],
    ),
    token: core.getInput('token', { required: true }),
  };
}

/** `typeof` answers "object" for arrays and for `null` too. */
export function isJsonObject(value: unknown): value is Spec {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Valid JSON that is not an object — a bare array, a string — would reach the
 * reconciler as something it cannot index. Checking here keeps that failure at
 * the input boundary.
 */
export async function loadSpec(specPath: string): Promise<Spec> {
  core.info(`Reading spec from ${specPath}`);

  const contents = await readFile(specPath, 'utf8');
  const spec: unknown = JSON.parse(contents);

  if (!isJsonObject(spec)) {
    throw new Error(`Spec at ${specPath} is not a JSON object`);
  }

  return spec;
}

/**
 * `setFailed` accepts `string | Error`, so a caught `unknown` needs narrowing.
 *
 * Narrowing here also drops the "Error:" prefix `setFailed` adds through
 * `toString()`. Everything else is serialised the way `setFailed` would: a
 * bare `String()` renders an object as "[object Object]".
 */
export function describeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;

  try {
    return JSON.stringify(error) ?? String(error);
  } catch {
    // Serialising a cyclic value throws, and throwing from the failure handler
    // would replace a reported failure with a crash.
    return String(error);
  }
}

export async function run(): Promise<void> {
  const { specPath, token } = readInputs();

  // The runner masks `secrets.*` values already. A token arriving by another
  // route — a `vars` entry, a literal in a composite — is not masked, and this
  // is the only point that knows the value is a credential.
  core.setSecret(token);

  // Called for the validation, not the result.
  await loadSpec(specPath);

  core.info('Spec parsed. Reconciliation is not implemented yet; nothing was changed.');
}
