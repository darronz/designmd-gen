import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { parse, serialize, mergeTokenSets } from '../src/index.js';

const CSS_FIXTURE = resolve(import.meta.dirname, 'fixtures/tokens.css');
const DTCG_FIXTURE = resolve(import.meta.dirname, 'fixtures/dtcg-tokens.json');

describe('public API', () => {
  it('exports parse, serialize, and mergeTokenSets', () => {
    expect(typeof parse).toBe('function');
    expect(typeof serialize).toBe('function');
    expect(typeof mergeTokenSets).toBe('function');
  });

  it('parse auto-detects CSS and returns DesignTokenSet', () => {
    const result = parse(CSS_FIXTURE);
    expect(result.name).toBe('tokens');
    expect(result.colors?.primary).toBe('#1a1c1e');
  });

  it('parse accepts explicit parser name', () => {
    const result = parse(DTCG_FIXTURE, 'dtcg');
    expect(result.name).toBe('DTCG Test System');
  });

  it('end-to-end: parse → merge → serialize produces valid YAML frontmatter', () => {
    const css = parse(CSS_FIXTURE);
    const dtcg = parse(DTCG_FIXTURE, 'dtcg');
    const merged = mergeTokenSets([css, dtcg]);
    const output = serialize(merged);
    expect(output.startsWith('---\n')).toBe(true);
    expect(output.endsWith('---\n')).toBe(true);
    expect(output).toContain('name:');
    expect(output).toContain('colors:');
  });
});
