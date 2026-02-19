# Security Policy

## Supported Versions

Security fixes are applied to the latest published release and `main`.

| Version | Supported |
|---------|-----------|
| `v0.x`  | Yes       |
| `< v0`  | No        |

## Reporting a Vulnerability

Please do not open public GitHub issues for vulnerabilities.

Report privately with:

- Repository: `Just-Boring-Cat/codex-mem`
- Preferred channel: GitHub Security Advisories (private report)
- Fallback: open a private contact request via repository owner profile

Include:

1. Clear impact summary
2. Steps to reproduce
3. Affected version/commit
4. Suggested remediation (optional)

## Response Targets

- Initial acknowledgment: within 3 business days
- Triage decision: within 7 business days
- Fix timeline: based on severity and exploitability

## Scope Notes

- `codex-mem` is local-first and stores data in local SQLite files.
- Do not store secrets in memory entries.
- Secret-like payloads are blocked by policy checks, but this is not a replacement for secure secret storage.
