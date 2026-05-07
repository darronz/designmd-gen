import { describe, it, expect, vi } from 'vitest';
import { resolve } from 'node:path';
import { cssParser } from '../../src/parsers/css.js';

const FIXTURE = resolve(import.meta.dirname, '../fixtures/tokens.css');

describe('cssParser', () => {
  it('has correct metadata', () => {
    expect(cssParser.name).toBe('css');
    expect(cssParser.extensions).toContain('.css');
  });

  it('detects .css files', () => {
    expect(cssParser.detect('styles.css')).toBe(true);
    expect(cssParser.detect('tokens.json')).toBe(false);
  });

  it('extracts colors with hex normalization', () => {
    const result = cssParser.parse(FIXTURE);
    expect(result.colors?.primary).toBe('#1a1c1e');
    expect(result.colors?.secondary).toBe('#6c7278');
    expect(result.colors?.accent).toBe('#ff0000');
  });

  it('skips var() color references with warning', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = cssParser.parse(FIXTURE);
    expect(result.colors?.dynamic).toBeUndefined();
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('--color-dynamic'));
    spy.mockRestore();
  });

  it('groups font properties into typography tokens', () => {
    const result = cssParser.parse(FIXTURE);
    expect(result.typography?.heading).toEqual({
      fontFamily: "'Public Sans'",
      fontSize: '3rem',
      fontWeight: 700,
    });
    expect(result.typography?.body).toEqual({
      fontFamily: "'Inter'",
      fontSize: '1rem',
    });
  });

  it('extracts spacing tokens', () => {
    const result = cssParser.parse(FIXTURE);
    expect(result.spacing).toEqual({ sm: '8px', md: '16px' });
  });

  it('extracts rounded tokens', () => {
    const result = cssParser.parse(FIXTURE);
    expect(result.rounded).toEqual({ sm: '4px', md: '8px' });
  });

  it('warns on unmapped variables', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    cssParser.parse(FIXTURE);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('--unmapped-var'));
    spy.mockRestore();
  });

  it('uses filename as name', () => {
    const result = cssParser.parse(FIXTURE);
    expect(result.name).toBe('tokens');
  });
});
