import { describe, it, expect, afterEach } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readFileSync, unlinkSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const CLI = resolve(import.meta.dirname, '../src/cli.ts');
const CSS_FIXTURE = resolve(import.meta.dirname, 'fixtures/tokens.css');
const OUT_FILE = resolve(import.meta.dirname, 'fixtures/test-output-DESIGN.md');

function run(args: string[]): string {
  return execFileSync('npx', ['tsx', CLI, ...args], {
    encoding: 'utf-8',
    cwd: resolve(import.meta.dirname, '..'),
    timeout: 10000,
  });
}

describe('CLI', () => {
  afterEach(() => {
    if (existsSync(OUT_FILE)) unlinkSync(OUT_FILE);
  });

  it('--help shows usage', () => {
    const output = run(['--help']);
    expect(output).toContain('designmd-gen');
    expect(output).toContain('--parser');
    expect(output).toContain('--name');
  });

  it('--dry-run prints YAML to stdout without writing', () => {
    const output = run([CSS_FIXTURE, '--name', 'TestCLI', '--dry-run', '--no-lint']);
    expect(output).toContain('---');
    expect(output).toContain('name: TestCLI');
    expect(output).toContain('colors:');
  });

  it('writes DESIGN.md to --out path', () => {
    run([CSS_FIXTURE, '--name', 'TestCLI', '-o', OUT_FILE, '--no-lint']);
    expect(existsSync(OUT_FILE)).toBe(true);
    const content = readFileSync(OUT_FILE, 'utf-8');
    expect(content).toContain('name: TestCLI');
  });

  it('errors when no files are provided', () => {
    expect(() => run([])).toThrow();
  });

  it('errors when no tokens are extracted', () => {
    expect(() => run(['--name', 'Empty', '--no-lint', 'nonexistent.css'])).toThrow();
  });
});
