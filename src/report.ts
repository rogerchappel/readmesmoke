import type { CommandResult, ReportFormat, SmokeReport } from './types.js';

export function buildReport(root: string, dryRun: boolean, results: CommandResult[]): SmokeReport {
  return {
    generatedAt: new Date().toISOString(),
    dryRun,
    root,
    totals: {
      planned: results.length,
      allowed: results.filter((result) => result.allowed).length,
      denied: results.filter((result) => !result.allowed).length,
      passed: results.filter((result) => result.status === 'passed').length,
      failed: results.filter((result) => result.status === 'failed').length,
      skipped: results.filter((result) => result.status === 'skipped').length
    },
    results
  };
}

export function renderReport(report: SmokeReport, format: ReportFormat): string {
  if (format === 'json') return `${JSON.stringify(report, null, 2)}\n`;
  return renderMarkdown(report);
}

export function renderMarkdown(report: SmokeReport): string {
  const lines = [
    '# readmesmoke report',
    '',
    `Generated: ${report.generatedAt}`,
    `Mode: ${report.dryRun ? 'dry-run' : 'execute'}`,
    '',
    '| Planned | Allowed | Denied | Passed | Failed | Skipped |',
    '| ---: | ---: | ---: | ---: | ---: | ---: |',
    `| ${report.totals.planned} | ${report.totals.allowed} | ${report.totals.denied} | ${report.totals.passed} | ${report.totals.failed} | ${report.totals.skipped} |`,
    ''
  ];
  for (const result of report.results) {
    lines.push(`## ${icon(result.status)} ${result.command}`);
    lines.push(`- Source: ${result.file}:${result.lineStart}`);
    lines.push(`- Status: ${result.status}${result.exitCode === null ? '' : ` (${result.exitCode})`}`);
    if (result.error) lines.push(`- Note: ${result.error}`);
    if (result.stderr.trim()) lines.push('', '```text', trimOutput(result.stderr), '```');
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}

function icon(status: CommandResult['status']): string {
  return status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⏭️';
}

function trimOutput(output: string): string {
  return output.trim().slice(0, 4_000);
}
