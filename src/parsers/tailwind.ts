import { basename, resolve as resolvePath } from 'node:path';
import { createJiti } from 'jiti';
import { normalizeColor } from '../core/colors.js';
import type { DesignTokenSet, ParserPlugin, TypographyToken } from '../core/types.js';

function flatten(
  obj: Record<string, unknown>,
  prefix: string = '',
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      const name = key === 'DEFAULT'
        ? prefix
        : prefix
          ? `${prefix}-${key}`
          : key;
      result[name] = value;
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const nested = flatten(
        value as Record<string, unknown>,
        prefix ? `${prefix}-${key}` : key,
      );
      Object.assign(result, nested);
    }
  }
  return result;
}

function loadConfig(filePath: string): Record<string, unknown> {
  const absPath = resolvePath(filePath);
  const jiti = createJiti(absPath);
  const mod = jiti(absPath) as Record<string, unknown>;
  return (mod.default ?? mod) as Record<string, unknown>;
}

export const tailwindParser: ParserPlugin = {
  name: 'tailwind',
  extensions: ['.js', '.ts', '.mjs'],

  detect(filePath: string): boolean {
    const name = basename(filePath);
    return name.startsWith('tailwind.config');
  },

  parse(filePath: string): DesignTokenSet {
    const config = loadConfig(filePath);
    const theme = (config.theme ?? {}) as Record<string, unknown>;
    const name = basename(filePath).replace(/\.config\.\w+$/, '');

    const colors: Record<string, string> = {};
    const typography: Record<string, TypographyToken> = {};
    const spacing: Record<string, string> = {};
    const rounded: Record<string, string> = {};

    if (theme.colors && typeof theme.colors === 'object') {
      if (typeof theme.colors === 'function') {
        console.warn('Skipped colors: functional values are not supported');
      } else {
        const flat = flatten(theme.colors as Record<string, unknown>);
        for (const [tokenName, value] of Object.entries(flat)) {
          const hex = normalizeColor(value);
          if (hex) {
            colors[tokenName] = hex;
          } else {
            console.warn(`Skipped color "${tokenName}": cannot normalize "${value}"`);
          }
        }
      }
    }

    if (theme.fontSize && typeof theme.fontSize === 'object' && typeof theme.fontSize !== 'function') {
      const sizes = theme.fontSize as Record<string, unknown>;
      for (const [tokenName, value] of Object.entries(sizes)) {
        const fontSize = Array.isArray(value) ? String(value[0]) : String(value);
        if (!typography[tokenName]) typography[tokenName] = {};
        typography[tokenName].fontSize = fontSize;
      }
    }

    if (theme.fontFamily && typeof theme.fontFamily === 'object' && typeof theme.fontFamily !== 'function') {
      const families = theme.fontFamily as Record<string, unknown>;
      for (const [tokenName, value] of Object.entries(families)) {
        const fontFamily = Array.isArray(value) ? value.join(', ') : String(value);
        if (!typography[tokenName]) typography[tokenName] = {};
        typography[tokenName].fontFamily = fontFamily;
      }
    }

    if (theme.spacing && typeof theme.spacing === 'object' && typeof theme.spacing !== 'function') {
      const flat = flatten(theme.spacing as Record<string, unknown>);
      Object.assign(spacing, flat);
    }

    if (theme.borderRadius && typeof theme.borderRadius === 'object' && typeof theme.borderRadius !== 'function') {
      const flat = flatten(theme.borderRadius as Record<string, unknown>);
      Object.assign(rounded, flat);
    }

    const result: DesignTokenSet = { name };
    if (Object.keys(colors).length > 0) result.colors = colors;
    if (Object.keys(typography).length > 0) result.typography = typography;
    if (Object.keys(spacing).length > 0) result.spacing = spacing;
    if (Object.keys(rounded).length > 0) result.rounded = rounded;
    return result;
  },
};
