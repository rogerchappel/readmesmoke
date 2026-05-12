#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { buildReport, loadConfig, plan, renderReport, runPlan } from './index.js';
import type { ReportFormat, SmokeReport } from './types.js';
import { toErrorMessage } from './errors.js';

interface Options { config?: string; format: ReportFormat; execute: boolean; input?: string; root: string }

async function main(argv: string[]): Promise<number> {
  const [command, ...rest] = argv;
  if (!command || command === '--help' || command === '-h') {
    usage();
    return 0;
  }
  const options = parseOptions(rest);
  if (command === 'scan') return scan(options);
  if (command === 'run') return run(options);
  if (command === 'report') return report(options);
  throw new Error(`unknown command: ${command}`);
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
  if (!options.input) throw new Error('report requires --input <file>');
  const parsed = JSON.parse(await readFile(resolve(options.root, options.input), 'utf8')) as SmokeReport;
  process.stdout.write(renderReport(parsed, options.format));
  return parsed.totals.failed > 0 ? 1 : 0;
}

function parseOptions(args: string[]): Options {
  const options: Options = { format: 'markdown', execute: false, root: process.cwd() };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--config') options.config = args[++index];
    else if (arg === '--format') options.format = args[++index] as ReportFormat;
    else if (arg === '--json') options.format = 'json';
    else if (arg === '--markdown') options.format = 'markdown';
    else if (arg === '--execute') options.execute = true;
    else if (arg === '--input') options.input = args[++index];
    else if (arg === '--root') options.root = resolve(args[++index]);
    else throw new Error(`unknown option: ${arg}`);
  }
  if (!['json', 'markdown'].includes(options.format)) throw new Error('--format must be json or markdown');
  return options;
}

function usage(): void {
  process.stdout.write(`readmesmoke\n\nUsage:\n  readmesmoke scan [--json] [--config path]\n  readmesmoke run [--execute] [--json] [--config path]\n  readmesmoke report --input report.json [--markdown|--json]\n\nCommands are dry-run unless run is passed --execute.\n`);
}

main(process.argv.slice(2)).then((code) => {
  process.exitCode = code;
}).catch((error: unknown) => {
  process.stderr.write(`readmesmoke: ${toErrorMessage(error)}\n`);
  process.exitCode = 1;
});
