import { describe, it, expect } from 'vitest';
import { getBuiltinPlugins, resolveParser } from '../src/plugins.js';

describe('getBuiltinPlugins', () => {
  it('returns all four built-in parsers', () => {
    const plugins = getBuiltinPlugins();
    const names = plugins.map((p) => p.name);
    expect(names).toContain('css');
    expect(names).toContain('dtcg');
    expect(names).toContain('tailwind');
    expect(names).toContain('style-dictionary');
    expect(plugins).toHaveLength(4);
  });

  it('each plugin has extensions and detect/parse methods', () => {
    for (const plugin of getBuiltinPlugins()) {
      expect(plugin.extensions.length).toBeGreaterThan(0);
      expect(typeof plugin.detect).toBe('function');
      expect(typeof plugin.parse).toBe('function');
    }
  });
});

describe('resolveParser', () => {
  it('resolves by explicit name', () => {
    const parser = resolveParser('test.css', 'css');
    expect(parser.name).toBe('css');
  });

  it('auto-detects CSS files', () => {
    const parser = resolveParser('tokens.css');
    expect(parser.name).toBe('css');
  });

  it('auto-detects tailwind config', () => {
    const parser = resolveParser('tailwind.config.js');
    expect(parser.name).toBe('tailwind');
  });

  it('throws for unknown parser name', () => {
    expect(() => resolveParser('file.xyz', 'unknown')).toThrow('Unknown parser');
  });

  it('throws when no parser matches', () => {
    expect(() => resolveParser('file.xyz')).toThrow('No parser found');
  });
});
