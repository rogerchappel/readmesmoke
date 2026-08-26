export type ReportFormat = 'json' | 'markdown';

export interface ReadmeSmokeConfig {
  docs: string[];
  allow: string[];
  env?: Record<string, string>;
  fixtures?: string[];
  timeoutMs: number;
  redact?: string[];
}

export interface CommandSnippet {
  id: string;
  file: string;
  language: string;
  command: string;
  lineStart: number;
  lineEnd: number;
  reason: 'fenced-block' | 'readmesmoke-hint';
}

export interface PlannedCommand extends CommandSnippet {
  allowed: boolean;
  allowPattern?: string;
  risk: RiskFinding[];
}

export interface RiskFinding {
  level: 'info' | 'warn' | 'deny';
  code: string;
  message: string;
}

export interface CommandResult extends PlannedCommand {
  status: 'passed' | 'failed' | 'skipped';
  exitCode: number | null;
  durationMs: number;
  stdout: string;
  stderr: string;
  error?: string;
}

export interface SmokeReport {
  generatedAt: string;
  dryRun: boolean;
  root: string;
  totals: {
    planned: number;
    allowed: number;
    denied: number;
    passed: number;
    failed: number;
    skipped: number;
  };
  results: CommandResult[];
}
