import type { RiskFinding } from './types.js';

const DENY_PATTERNS: Array<[RegExp, string]> = [
  [/\brm\s+-rf\s+(?:\/|~|\$HOME)(?=\s|[;&|)]|$)/, 'refuses destructive recursive removal'],
  [/\b(?:curl|wget)\b[\s\S]*\|\s*(?:bash|zsh|sh)\b/, 'refuses network-to-shell pipelines'],
  [/\bsudo\b/, 'refuses privileged commands'],
  [/\b(?:scp|rsync|ssh)\b/, 'refuses remote shell/file commands'],
  [/>\s*\/dev\/(?:disk|rdisk)/, 'refuses raw device writes']
];

const WARN_PATTERNS: Array<[RegExp, string]> = [
  [/\b(?:curl|wget)\b/, 'network access may be required'],
  [/\b(?:npm|pnpm|yarn|bun)\s+(?:publish|login|adduser)\b/, 'package registry mutation/login command'],
  [/\b(?:git)\s+push\b/, 'git remote mutation command']
];

export function inspectRisk(command: string): RiskFinding[] {
  const findings: RiskFinding[] = [];
  for (const [pattern, message] of DENY_PATTERNS) {
    if (pattern.test(command)) findings.push({ level: 'deny', code: 'dangerous-command', message });
  }
  for (const [pattern, message] of WARN_PATTERNS) {
    if (pattern.test(command)) findings.push({ level: 'warn', code: 'review-command', message });
  }
  return findings.length > 0 ? findings : [{ level: 'info', code: 'looks-local', message: 'no built-in risky pattern matched' }];
}

export function isDenied(findings: RiskFinding[]): boolean {
  return findings.some((finding) => finding.level === 'deny');
}
