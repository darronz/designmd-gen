import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { dtcgParser } from '../../src/parsers/dtcg.js';

const FIXTURE = resolve(import.meta.dirname, '../fixtures/dtcg-tokens.json');

describe('dtcgParser', () => {
  it('has correct metadata', () => {
    expect(dtcgParser.name).toBe('dtcg');
    expect(dtcgParser.extensions).toContain('.json');
  });

  it('detects DTCG files by $value keys', () => {
    expect(dtcgParser.detect(FIXTURE)).toBe(true);
  });

  it('extracts color tokens', () => {
    const result = dtcgParser.parse(FIXTURE);
    expect(result.colors?.primary).toBe('#1a1c1e');
    expect(result.colors?.secondary).toBe('#6c7278');
  });

  it('resolves alias references', () => {
    const result = dtcgParser.parse(FIXTURE);
    expect(result.colors?.alias).toBe('#1a1c1e');
  });

  it('extracts spacing from dimension groups named "spacing"', () => {
    const result = dtcgParser.parse(FIXTURE);
    expect(result.spacing).toEqual({ sm: '8px', md: '16px' });
  });

  it('extracts rounded from dimension groups named "border-radius"', () => {
    const result = dtcgParser.parse(FIXTURE);
    expect(result.rounded).toEqual({ sm: '4px', md: '8px' });
  });

  it('extracts typography tokens', () => {
    const result = dtcgParser.parse(FIXTURE);
    expect(result.typography?.heading).toEqual({
      fontFamily: 'Public Sans',
      fontSize: '3rem',
      fontWeight: 700,
      lineHeight: 1.2,
    });
    expect(result.typography?.body).toEqual({
      fontFamily: 'Inter',
      fontSize: '1rem',
    });
  });

  it('uses name from JSON if present', () => {
    const result = dtcgParser.parse(FIXTURE);
    expect(result.name).toBe('DTCG Test System');
  });
});
