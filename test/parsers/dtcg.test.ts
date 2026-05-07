import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { dtcgParser } from '../../src/parsers/dtcg.js';

const FIXTURE = resolve(import.meta.dirname, '../fixtures/dtcg-tokens.json');
const NESTED_FIXTURE = resolve(import.meta.dirname, '../fixtures/dtcg-nested-tokens.json');

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

describe('nested DTCG tokens', () => {
  it('strips organizational and type-category groups from color names', () => {
    const result = dtcgParser.parse(NESTED_FIXTURE);
    expect(result.colors?.['brand-primary']).toBe('#1a1c1e');
    expect(result.colors?.['neutral-50']).toBe('#f9fafb');
    expect(result.colors?.['neutral-900']).toBe('#111827');
    expect(result.colors?.['actionHover']).toBe('#1654dc');
  });

  it('resolves aliases in nested structures', () => {
    const result = dtcgParser.parse(NESTED_FIXTURE);
    expect(result.colors?.['primary']).toBe('#1a1c1e');
  });

  it('strips organizational groups from spacing names', () => {
    const result = dtcgParser.parse(NESTED_FIXTURE);
    expect(result.spacing?.['sm']).toBe('8px');
    expect(result.spacing?.['md']).toBe('16px');
  });

  it('routes nested radius tokens to rounded', () => {
    const result = dtcgParser.parse(NESTED_FIXTURE);
    expect(result.rounded).toEqual({ sm: '4px', lg: '9999px' });
  });

  it('does not put radius tokens in spacing', () => {
    const result = dtcgParser.parse(NESTED_FIXTURE);
    expect(result.spacing).not.toHaveProperty('sm', '4px');
    expect(result.spacing).not.toHaveProperty('lg', '9999px');
  });

  it('maps fontFamily tokens to typography entries', () => {
    const result = dtcgParser.parse(NESTED_FIXTURE);
    expect(result.typography?.['display']).toEqual({ fontFamily: 'Roboto' });
    expect(result.typography?.['body']).toEqual({ fontFamily: 'Inter' });
  });

  it('routes dimension tokens under typography groups as fontSize', () => {
    const result = dtcgParser.parse(NESTED_FIXTURE);
    expect(result.typography?.['sizes-base']).toEqual({ fontSize: '16px' });
    expect(result.typography?.['sizes-lg']).toEqual({ fontSize: '1.5rem' });
  });

  it('does not put typography dimensions in spacing', () => {
    const result = dtcgParser.parse(NESTED_FIXTURE);
    expect(result.spacing).not.toHaveProperty('sizes-base');
    expect(result.spacing).not.toHaveProperty('sizes-lg');
  });

  it('routes component-ancestor dimensions to components section', () => {
    const result = dtcgParser.parse(NESTED_FIXTURE);
    expect(result.components?.['button']).toEqual({
      height: '56px',
      padding: '18px',
    });
    expect(result.components?.['form']).toEqual({
      inputHeight: '48px',
    });
  });

  it('keeps component-ancestor colors in the colors section', () => {
    const result = dtcgParser.parse(NESTED_FIXTURE);
    expect(result.colors?.['form-borderColor']).toBe('#111827');
  });
});
