import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { tailwindParser } from '../../src/parsers/tailwind.js';

const FIXTURE = resolve(import.meta.dirname, '../fixtures/tailwind.config.js');

describe('tailwindParser', () => {
  it('has correct metadata', () => {
    expect(tailwindParser.name).toBe('tailwind');
    expect(tailwindParser.extensions).toEqual(['.js', '.ts', '.mjs']);
  });

  it('detects tailwind config by filename', () => {
    expect(tailwindParser.detect('tailwind.config.js')).toBe(true);
    expect(tailwindParser.detect('tailwind.config.ts')).toBe(true);
    expect(tailwindParser.detect('vite.config.ts')).toBe(false);
  });

  it('extracts flat colors', () => {
    const result = tailwindParser.parse(FIXTURE);
    expect(result.colors?.primary).toBe('#1a1c1e');
    expect(result.colors?.secondary).toBe('#6c7278');
  });

  it('flattens nested colors with dash separator', () => {
    const result = tailwindParser.parse(FIXTURE);
    expect(result.colors?.['gray-50']).toBe('#f9fafb');
    expect(result.colors?.['gray-100']).toBe('#f3f4f6');
  });

  it('uses DEFAULT as base name without suffix', () => {
    const result = tailwindParser.parse(FIXTURE);
    expect(result.colors?.gray).toBe('#9ca3af');
  });

  it('builds typography from fontSize and fontFamily', () => {
    const result = tailwindParser.parse(FIXTURE);
    expect(result.typography?.sm).toEqual({ fontSize: '0.875rem' });
    expect(result.typography?.base).toEqual({ fontSize: '1rem' });
    expect(result.typography?.sans).toEqual({ fontFamily: 'Public Sans, sans-serif' });
  });

  it('extracts spacing', () => {
    const result = tailwindParser.parse(FIXTURE);
    expect(result.spacing).toEqual({ sm: '8px', md: '16px', lg: '24px' });
  });

  it('extracts borderRadius as rounded', () => {
    const result = tailwindParser.parse(FIXTURE);
    expect(result.rounded).toEqual({ sm: '4px', md: '8px', lg: '12px' });
  });

  it('uses filename as name', () => {
    const result = tailwindParser.parse(FIXTURE);
    expect(result.name).toBe('tailwind');
  });
});
