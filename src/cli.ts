#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { buildReport, ConfigError, loadConfig, plan, renderReport, runPlan } from './index.js';
import type { ReportFormat, SmokeReport } from './types.js';
import { toErrorMessage } from './errors.js';

interface Options { config?: string; format: ReportFormat; execute: boolean; input?: string; root: string }
type Command = 'scan' | 'run' | 'report';

class CliUsageError extends Error {}

async function main(argv: string[]): Promise<number> {
  const [command, ...rest] = argv;
  if (!command || command === '--help' || command === '-h') {
    usage();
    return 0;
  }
  if (!isCommand(command)) throw new CliUsageError(`unknown command: ${command}`);
  const options = parseOptions(command, rest);
  if (command === 'scan') return scan(options);
  if (command === 'run') return run(options);
  return report(options);
}

async function scan(options: Options): Promise<number> {
  const config = await loadConfig(options.root, options.config);
  const planned = await plan(options.root, config);
  const results = planned.map((item) => ({ ...item, status: 'skipped' as const, exitCode: null, durationMs: 0, stdout: '', stderr: '', error: 'planned only' }));
  process.stdout.write(renderReport(buildReport(options.root, true, results), options.format));
  return planned.some((item) => !item.allowed) ? 2 : 0;
}

async function run(options: Options): Promise<number> {
  const config = await loadConfig(options.root, options.config);
  const planned = await plan(options.root, config);
  const results = await runPlan(options.root, config, planned, options.execute);
  const report = buildReport(options.root, !options.execute, results);
  process.stdout.write(renderReport(report, options.format));
  return report.totals.failed > 0 || report.totals.denied > 0 ? 1 : 0;
}

async function report(options: Options): Promise<number> {
  if (!options.input) throw new CliUsageError('report requires --input <file>');
  const parsed = JSON.parse(await readFile(resolve(options.root, options.input), 'utf8')) as SmokeReport;
  process.stdout.write(renderReport(parsed, options.format));
  return parsed.totals.failed > 0 || parsed.totals.denied > 0 ? 1 : 0;
}

function isCommand(value: string): value is Command {
  return value === 'scan' || value === 'run' || value === 'report';
}

function parseOptions(command: Command, args: string[]): Options {
  const options: Options = { format: 'markdown', execute: false, root: process.cwd() };
  let selectedFormat: ReportFormat | undefined;
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--config') options.config = optionValue(args, ++index, arg);
    else if (arg === '--format') {
      const format = optionValue(args, ++index, arg);
      if (format !== 'json' && format !== 'markdown') {
        throw new CliUsageError('--format must be json or markdown');
      }
      selectedFormat = selectFormat(selectedFormat, format);
      options.format = format;
    } else if (arg === '--json' || arg === '--markdown') {
      const format = arg === '--json' ? 'json' : 'markdown';
      selectedFormat = selectFormat(selectedFormat, format);
      options.format = format;
    } else if (arg === '--execute') options.execute = true;
    else if (arg === '--input') options.input = optionValue(args, ++index, arg);
    else if (arg === '--root') options.root = resolve(optionValue(args, ++index, arg));
    else throw new CliUsageError(`unknown option: ${arg}`);
  }

  const allowed = new Set(
    command === 'scan' ? ['--config', '--format', '--json', '--markdown', '--root']
      : command === 'run' ? ['--config', '--format', '--json', '--markdown', '--execute', '--root']
        : ['--format', '--json', '--markdown', '--input', '--root']
  );
  const invalid = args.find((arg) => arg.startsWith('--') && !allowed.has(arg));
  if (invalid) throw new CliUsageError(`${invalid} is not valid for ${command}`);
  if (command === 'report' && !options.input) throw new CliUsageError('report requires --input <file>');
  return options;
}

function optionValue(args: string[], index: number, option: string): string {
  const value = args[index];
  if (!value || value.startsWith('-')) throw new CliUsageError(`${option} requires a value`);
  return value;
}

function selectFormat(current: ReportFormat | undefined, next: ReportFormat): ReportFormat {
  if (current && current !== next) throw new CliUsageError('conflicting output formats');
  return next;
}

function usage(stream: NodeJS.WritableStream = process.stdout): void {
  stream.write(`readmesmoke\n\nUsage:\n  readmesmoke scan [--json|--markdown|--format <format>] [--config <path>] [--root <path>]\n  readmesmoke run [--execute] [--json|--markdown|--format <format>] [--config <path>] [--root <path>]\n  readmesmoke report --input <file> [--markdown|--json|--format <format>] [--root <path>]\n\nCommands are dry-run unless run is passed --execute.\n`);
}

main(process.argv.slice(2)).then((code) => {
  process.exitCode = code;
}).catch((error: unknown) => {
  process.stderr.write(`readmesmoke: ${toErrorMessage(error)}\n`);
  if (error instanceof CliUsageError || error instanceof ConfigError) usage(process.stderr);
  process.exitCode = error instanceof CliUsageError || error instanceof ConfigError ? 2 : 1;
});
