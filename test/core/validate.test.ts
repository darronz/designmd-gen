import { describe, it, expect } from 'vitest';
import { validate } from '../../src/core/validate.js';

describe('validate', () => {
  it('returns valid for a correct DESIGN.md', () => {
    const content = [
      '---',
      'name: Test',
      'colors:',
      '  primary: "#1A1C1E"',
      '---',
    ].join('\n');
    const result = validate(content);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns errors for invalid content', () => {
    // Use a color token with an invalid value to trigger an error finding
    const content = [
      '---',
      'name: Test',
      'colors:',
      '  primary: "not-a-color"',
      '---',
    ].join('\n');
    const result = validate(content);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('separates warnings from errors', () => {
    const content = [
      '---',
      'name: Test',
      'colors:',
      '  primary: "#1A1C1E"',
      '---',
    ].join('\n');
    const result = validate(content);
    expect(Array.isArray(result.warnings)).toBe(true);
  });
});
