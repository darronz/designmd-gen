import { describe, it, expect, vi } from 'vitest';
import { mergeTokenSets } from '../../src/core/merge.js';
import type { DesignTokenSet } from '../../src/core/types.js';

describe('mergeTokenSets', () => {
  it('returns single token set unchanged', () => {
    const set: DesignTokenSet = {
      name: 'A',
      colors: { primary: '#000' },
    };
    expect(mergeTokenSets([set])).toEqual(set);
  });

  it('merges colors from multiple sets', () => {
    const a: DesignTokenSet = { name: 'A', colors: { primary: '#000' } };
    const b: DesignTokenSet = { name: 'B', colors: { secondary: '#fff' } };
    const result = mergeTokenSets([a, b]);
    expect(result.colors).toEqual({ primary: '#000', secondary: '#fff' });
  });

  it('later sets override earlier for conflicting tokens', () => {
    const a: DesignTokenSet = { name: 'A', colors: { primary: '#000' } };
    const b: DesignTokenSet = { name: 'B', colors: { primary: '#fff' } };
    const result = mergeTokenSets([a, b]);
    expect(result.colors!.primary).toBe('#fff');
  });

  it('uses the last name', () => {
    const a: DesignTokenSet = { name: 'First' };
    const b: DesignTokenSet = { name: 'Second' };
    expect(mergeTokenSets([a, b]).name).toBe('Second');
  });

  it('merges typography tokens', () => {
    const a: DesignTokenSet = {
      name: 'A',
      typography: { h1: { fontSize: '3rem' } },
    };
    const b: DesignTokenSet = {
      name: 'B',
      typography: { body: { fontSize: '1rem' } },
    };
    const result = mergeTokenSets([a, b]);
    expect(result.typography).toEqual({
      h1: { fontSize: '3rem' },
      body: { fontSize: '1rem' },
    });
  });

  it('merges spacing and rounded', () => {
    const a: DesignTokenSet = { name: 'A', spacing: { sm: '8px' } };
    const b: DesignTokenSet = { name: 'B', rounded: { md: '8px' } };
    const result = mergeTokenSets([a, b]);
    expect(result.spacing).toEqual({ sm: '8px' });
    expect(result.rounded).toEqual({ md: '8px' });
  });

  it('warns on conflicting token names', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const a: DesignTokenSet = { name: 'A', colors: { primary: '#000' } };
    const b: DesignTokenSet = { name: 'B', colors: { primary: '#fff' } };
    mergeTokenSets([a, b]);
    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining('primary'),
    );
    spy.mockRestore();
  });

  it('throws on empty array', () => {
    expect(() => mergeTokenSets([])).toThrow();
  });
});
