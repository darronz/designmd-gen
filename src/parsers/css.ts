import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import postcss from 'postcss';
import { normalizeColor } from '../core/colors.js';
import type { DesignTokenSet, ParserPlugin, TypographyToken } from '../core/types.js';

const COLOR_PREFIXES = ['--color-', '--clr-'];
const FONT_PREFIXES = ['--font-', '--text-'];
const SPACING_PREFIXES = ['--spacing-', '--space-'];
const ROUNDED_PREFIXES = ['--radius-', '--rounded-'];

const FONT_PROP_MAP: Record<string, keyof TypographyToken> = {
  family: 'fontFamily',
  size: 'fontSize',
  weight: 'fontWeight',
  'line-height': 'lineHeight',
  lh: 'lineHeight',
  'letter-spacing': 'letterSpacing',
  ls: 'letterSpacing',
};

const FONT_SUFFIXES = Object.keys(FONT_PROP_MAP).sort((a, b) => b.length - a.length);

function matchPrefix(prop: string, prefixes: string[]): string | null {
  for (const prefix of prefixes) {
    if (prop.startsWith(prefix)) {
      return prop.slice(prefix.length);
    }
  }
  return null;
}

function parseFontProp(remainder: string): { group: string; prop: keyof TypographyToken } | null {
  for (const suffix of FONT_SUFFIXES) {
    if (remainder.endsWith(`-${suffix}`)) {
      const group = remainder.slice(0, -(suffix.length + 1));
      if (group) {
        return { group, prop: FONT_PROP_MAP[suffix] };
      }
    }
  }
  return null;
}

function coerceTypographyValue(prop: keyof TypographyToken, value: string): string | number {
  if (prop === 'fontWeight') {
    const num = Number(value);
    return Number.isNaN(num) ? value as unknown as number : num;
  }
  return value;
}

export const cssParser: ParserPlugin = {
  name: 'css',
  extensions: ['.css'],

  detect(filePath: string): boolean {
    return filePath.endsWith('.css');
  },

  parse(filePath: string): DesignTokenSet {
    const content = readFileSync(filePath, 'utf-8');
    const root = postcss.parse(content);
    const name = basename(filePath, '.css');

    const colors: Record<string, string> = {};
    const typography: Record<string, TypographyToken> = {};
    const spacing: Record<string, string> = {};
    const rounded: Record<string, string> = {};

    root.walkRules((rule) => {
      if (rule.selector !== ':root' && rule.selector !== 'html') return;

      rule.walkDecls(/^--/, (decl) => {
        const prop = decl.prop;
        const value = decl.value;

        const colorName = matchPrefix(prop, COLOR_PREFIXES);
        if (colorName !== null) {
          const hex = normalizeColor(value);
          if (hex) {
            colors[colorName] = hex;
          } else {
            console.warn(`Skipped ${prop}: cannot resolve "${value}"`);
          }
          return;
        }

        const fontRemainder = matchPrefix(prop, FONT_PREFIXES);
        if (fontRemainder !== null) {
          const parsed = parseFontProp(fontRemainder);
          if (parsed) {
            if (!typography[parsed.group]) {
              typography[parsed.group] = {};
            }
            (typography[parsed.group] as Record<string, string | number>)[parsed.prop] =
              coerceTypographyValue(parsed.prop, value);
          } else {
            console.warn(`Skipped ${prop}: unrecognized font property suffix`);
          }
          return;
        }

        const spacingName = matchPrefix(prop, SPACING_PREFIXES);
        if (spacingName !== null) {
          spacing[spacingName] = value;
          return;
        }

        const roundedName = matchPrefix(prop, ROUNDED_PREFIXES);
        if (roundedName !== null) {
          rounded[roundedName] = value;
          return;
        }

        console.warn(`Skipped ${prop}: no matching token category`);
      });
    });

    const result: DesignTokenSet = { name };
    if (Object.keys(colors).length > 0) result.colors = colors;
    if (Object.keys(typography).length > 0) result.typography = typography;
    if (Object.keys(spacing).length > 0) result.spacing = spacing;
    if (Object.keys(rounded).length > 0) result.rounded = rounded;
    return result;
  },
};
