import { describe, it, expect } from 'vitest';
import { serialize } from '../../src/core/serialize.js';
import type { DesignTokenSet } from '../../src/core/types.js';

describe('serialize', () => {
  it('serializes minimal token set with just name', () => {
    const tokens: DesignTokenSet = { name: 'TestSystem' };
    const result = serialize(tokens);
    expect(result).toBe('---\nname: TestSystem\n---\n');
  });

  it('serializes colors with quoted hex values', () => {
    const tokens: DesignTokenSet = {
      name: 'Test',
      colors: { primary: '#1A1C1E', secondary: '#6C7278' },
    };
    const result = serialize(tokens);
    expect(result).toContain('colors:');
    expect(result).toContain('primary: "#1A1C1E"');
    expect(result).toContain('secondary: "#6C7278"');
  });

  it('serializes typography tokens as nested objects', () => {
    const tokens: DesignTokenSet = {
      name: 'Test',
      typography: {
        h1: { fontFamily: 'Public Sans', fontSize: '3rem', fontWeight: 700 },
      },
    };
    const result = serialize(tokens);
    expect(result).toContain('typography:');
    expect(result).toContain('h1:');
    expect(result).toContain('fontFamily: Public Sans');
    expect(result).toContain('fontSize: 3rem');
    expect(result).toContain('fontWeight: 700');
  });

  it('serializes spacing and rounded', () => {
    const tokens: DesignTokenSet = {
      name: 'Test',
      rounded: { sm: '4px', md: '8px' },
      spacing: { sm: '8px', md: '16px' },
    };
    const result = serialize(tokens);
    expect(result).toContain('rounded:');
    expect(result).toContain('spacing:');
  });

  it('serializes components with token references', () => {
    const tokens: DesignTokenSet = {
      name: 'Test',
      components: {
        'button-primary': {
          backgroundColor: '{colors.tertiary}',
          textColor: '{colors.on-tertiary}',
        },
      },
    };
    const result = serialize(tokens);
    expect(result).toContain('button-primary:');
    expect(result).toContain('backgroundColor: "{colors.tertiary}"');
  });

  it('omits undefined sections', () => {
    const tokens: DesignTokenSet = { name: 'Test', colors: { primary: '#000' } };
    const result = serialize(tokens);
    expect(result).not.toContain('typography:');
    expect(result).not.toContain('spacing:');
    expect(result).not.toContain('rounded:');
    expect(result).not.toContain('components:');
  });

  it('orders keys: name, description, colors, typography, rounded, spacing, components', () => {
    const tokens: DesignTokenSet = {
      name: 'Test',
      description: 'A test system',
      spacing: { sm: '8px' },
      colors: { primary: '#000' },
      typography: { body: { fontSize: '1rem' } },
      rounded: { sm: '4px' },
      components: { btn: { backgroundColor: '#000' } },
    };
    const result = serialize(tokens);
    const nameIdx = result.indexOf('name:');
    const descIdx = result.indexOf('description:');
    const colorsIdx = result.indexOf('colors:');
    const typoIdx = result.indexOf('typography:');
    const roundedIdx = result.indexOf('rounded:');
    const spacingIdx = result.indexOf('spacing:');
    const compIdx = result.indexOf('components:');
    expect(nameIdx).toBeLessThan(descIdx);
    expect(descIdx).toBeLessThan(colorsIdx);
    expect(colorsIdx).toBeLessThan(typoIdx);
    expect(typoIdx).toBeLessThan(roundedIdx);
    expect(roundedIdx).toBeLessThan(spacingIdx);
    expect(spacingIdx).toBeLessThan(compIdx);
  });

  it('wraps output in --- delimiters', () => {
    const tokens: DesignTokenSet = { name: 'Test' };
    const result = serialize(tokens);
    expect(result.startsWith('---\n')).toBe(true);
    expect(result.endsWith('---\n')).toBe(true);
  });
});
