# Security

`readmesmoke` executes maintainer-approved local commands. Please treat command execution behavior as security-sensitive.

## Reporting a vulnerability

Open a private security advisory on GitHub if available, or contact the maintainer through the repository issue tracker with a minimal, non-destructive reproduction.

Useful reports include:

- allowlist bypasses;
- dangerous commands that are not denied;
- secret redaction failures;
- fixture workspace escapes;
- CLI behavior that executes without explicit approval.

## Scope

This project does not claim to sandbox untrusted code. Running hostile docs still requires an external isolation boundary such as a disposable VM or container.
