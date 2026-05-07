import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { styleDictionaryParser } from '../../src/parsers/style-dictionary.js';

const FIXTURE = resolve(import.meta.dirname, '../fixtures/sd-tokens.json');

describe('styleDictionaryParser', () => {
  it('has correct metadata', () => {
    expect(styleDictionaryParser.name).toBe('style-dictionary');
    expect(styleDictionaryParser.extensions).toContain('.json');
  });

  it('detects Style Dictionary files by "value" keys (no $ prefix)', () => {
    expect(styleDictionaryParser.detect(FIXTURE)).toBe(true);
  });

  it('does not detect DTCG files', () => {
    const dtcgFixture = resolve(import.meta.dirname, '../fixtures/dtcg-tokens.json');
    expect(styleDictionaryParser.detect(dtcgFixture)).toBe(false);
  });

  it('extracts color tokens', () => {
    const result = styleDictionaryParser.parse(FIXTURE);
    expect(result.colors?.primary).toBe('#1a1c1e');
    expect(result.colors?.secondary).toBe('#6c7278');
  });

  it('extracts spacing tokens', () => {
    const result = styleDictionaryParser.parse(FIXTURE);
    expect(result.spacing).toEqual({ sm: '8px', md: '16px' });
  });

  it('extracts rounded tokens from border-radius group', () => {
    const result = styleDictionaryParser.parse(FIXTURE);
    expect(result.rounded).toEqual({ sm: '4px', md: '8px' });
  });

  it('extracts typography tokens', () => {
    const result = styleDictionaryParser.parse(FIXTURE);
    expect(result.typography?.heading).toEqual({
      fontFamily: 'Public Sans',
      fontSize: '3rem',
      fontWeight: 700,
    });
  });

  it('uses name from JSON', () => {
    const result = styleDictionaryParser.parse(FIXTURE);
    expect(result.name).toBe('SD Test System');
  });
});
