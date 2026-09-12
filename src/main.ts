// SPDX-FileCopyrightText: 2026 Alex Brandt <alunduil@gmail.com>
// SPDX-License-Identifier: MIT

import { readFile } from 'node:fs/promises';
import { isAbsolute, resolve } from 'node:path';

import * as core from '@actions/core';

/**
 * The action's inputs, after resolution against the runner's workspace.
 *
 * `token` is carried as a value rather than read from the environment at the
 * point of use so that the one place reading it is the one place that has to
 * keep it out of logs.
 */
export interface Inputs {
  /** Absolute path to the spec file. */
  specPath: string;
  /** Token authorised against the board and the source repositories. */
  token: string;
}

/**
 * Resolves the spec path against `GITHUB_WORKSPACE`.
 *
 * Actions run with the workspace as the working directory, but a composite or
 * container step can change that, so an explicit base is safer than a relative
 * open. An already-absolute input is taken as given.
 */
export function resolveSpecPath(spec: string, workspace: string | undefined): string {
  if (isAbsolute(spec)) return spec;

  return resolve(workspace ?? process.cwd(), spec);
}

/**
 * Reads the action's inputs.
 *
 * Both inputs are `required` in `action.yml`, which makes the runner reject a
 * workflow that omits them; `required: true` here turns a blank value into a
 * failure too, which `action.yml` alone does not catch.
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

/**
 * Runs a sync.
 *
 * The reconciler is not implemented yet, so this validates that the spec is
 * readable and parses as JSON, then reports what it would act on. That is
 * enough for the action to be wired end to end — `action.yml`, the bundle, and
 * a workflow calling it — without claiming behaviour it does not have.
 */
export async function run(): Promise<void> {
  const { specPath, token } = readInputs();

  // Registers the token with the runner's log filter. The runner masks a
  // secret passed through `secrets.*` already; a token reaching this input by
  // another route (a `vars` entry, a composite's literal) is not masked, and
  // this is the only point that knows the value is a credential.
  core.setSecret(token);

  core.info(`Reading spec from ${specPath}`);

  const contents = await readFile(specPath, 'utf8');
  const spec: unknown = JSON.parse(contents);

  // `typeof` reports "object" for arrays and for null, so neither is excluded
  // by the type check alone.
  if (typeof spec !== 'object' || spec === null || Array.isArray(spec)) {
    throw new Error(`Spec at ${specPath} is not a JSON object`);
  }

  core.info('Spec parsed. Reconciliation is not implemented yet; nothing was changed.');
}
