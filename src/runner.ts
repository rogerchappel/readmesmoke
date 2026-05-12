import { spawn } from 'node:child_process';
import { performance } from 'node:perf_hooks';
import { redactText } from './redact.js';
import { prepareWorkspace } from './workspace.js';
import type { CommandResult, PlannedCommand, ReadmeSmokeConfig } from './types.js';

export async function runPlan(root: string, config: ReadmeSmokeConfig, commands: PlannedCommand[], execute: boolean): Promise<CommandResult[]> {
  const workspace = await prepareWorkspace(root, config);
  try {
    const results: CommandResult[] = [];
    for (const command of commands) {
      if (!execute || !command.allowed) {
        results.push(skipped(command, execute ? 'command is not allowlisted' : 'dry-run'));
        continue;
      }
      results.push(await runCommand(command, workspace.path, config));
    }
    return results;
  } finally {
    await workspace.cleanup();
  }
}

function skipped(command: PlannedCommand, error: string): CommandResult {
  return { ...command, status: 'skipped', exitCode: null, durationMs: 0, stdout: '', stderr: '', error };
}

export function runCommand(command: PlannedCommand, cwd: string, config: ReadmeSmokeConfig): Promise<CommandResult> {
  const started = performance.now();
  return new Promise((resolve) => {
    const child = spawn(command.command, {
      cwd,
      env: { ...process.env, ...config.env },
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => child.kill('SIGTERM'), config.timeoutMs);
    child.stdout.on('data', (chunk) => { stdout += String(chunk); });
    child.stderr.on('data', (chunk) => { stderr += String(chunk); });
    child.on('close', (exitCode, signal) => {
      clearTimeout(timer);
      const durationMs = Math.round(performance.now() - started);
      const error = signal ? `terminated by ${signal}` : undefined;
      resolve({
        ...command,
        status: exitCode === 0 && !signal ? 'passed' : 'failed',
        exitCode,
        durationMs,
        stdout: redactText(stdout, config.env, config.redact),
        stderr: redactText(stderr, config.env, config.redact),
        error
      });
    });
    child.on('error', (error) => {
      clearTimeout(timer);
      resolve({ ...command, status: 'failed', exitCode: null, durationMs: Math.round(performance.now() - started), stdout, stderr, error: error.message });
    });
  });
}
