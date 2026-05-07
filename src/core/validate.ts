export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

type LintFinding = { severity: string; message: string };
type LintFn = (content: string) => {
  findings: LintFinding[];
  summary: { errors: number; warnings: number };
};

let lintFn: LintFn | null = null;

try {
  // @google/design.md is an alpha package — import may fail if unavailable
  const mod = await import('@google/design.md/linter' as string);
  lintFn = (mod as { lint: LintFn }).lint ?? null;
} catch {
  // Linter not available; validate() will degrade gracefully
}

export function validate(content: string): ValidationResult {
  if (lintFn === null) {
    return {
      valid: true,
      errors: [],
      warnings: ['@google/design.md not available — skipping validation'],
    };
  }

  const report = lintFn(content);
  const errors = report.findings
    .filter((f) => f.severity === 'error')
    .map((f) => f.message);
  const warnings = report.findings
    .filter((f) => f.severity === 'warning')
    .map((f) => f.message);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
