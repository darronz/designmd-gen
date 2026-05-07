import { describe, it, expect } from 'vitest';
import { normalizeColor } from '../../src/core/colors.js';

describe('normalizeColor', () => {
  it('passes through 6-digit hex unchanged (lowercased)', () => {
    expect(normalizeColor('#1A1C1E')).toBe('#1a1c1e');
  });

  it('expands 3-digit hex to 6-digit', () => {
    expect(normalizeColor('#fff')).toBe('#ffffff');
  });

  it('converts named colors to hex', () => {
    expect(normalizeColor('red')).toBe('#ff0000');
  });

  it('converts rgb() to hex', () => {
    expect(normalizeColor('rgb(108, 114, 120)')).toBe('#6c7278');
  });

  it('converts rgba() to hex (ignores alpha)', () => {
    const result = normalizeColor('rgba(0, 0, 0, 0.5)');
    expect(result).toBe('#00000080');
  });

  it('converts hsl() to hex', () => {
    const result = normalizeColor('hsl(0, 100%, 50%)');
    expect(result).toBe('#ff0000');
  });

  it('returns null for oklch (unsupported color space)', () => {
    expect(normalizeColor('oklch(0.5 0.2 240)')).toBeNull();
  });

  it('returns null for lab (unsupported color space)', () => {
    expect(normalizeColor('lab(50% 20 -30)')).toBeNull();
  });

  it('returns null for var() references', () => {
    expect(normalizeColor('var(--color-primary)')).toBeNull();
  });

  it('returns null for calc() expressions', () => {
    expect(normalizeColor('calc(100% - 10px)')).toBeNull();
  });

  it('returns null for unparseable values', () => {
    expect(normalizeColor('not-a-color')).toBeNull();
  });
});
