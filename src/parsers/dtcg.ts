import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { normalizeColor } from '../core/colors.js';
import type { DesignTokenSet, ParserPlugin, TypographyToken } from '../core/types.js';

const ROUNDED_GROUP_NAMES = new Set([
  'radius', 'rounded', 'border-radius', 'borderRadius', 'radii',
]);

function isToken(obj: unknown): obj is { $value: unknown; $type?: string } {
  return typeof obj === 'object' && obj !== null && '$value' in obj;
}

function resolveAlias(value: string, flatTokens: Map<string, unknown>): unknown {
  const match = value.match(/^\{(.+)\}$/);
  if (!match) return value;
  const resolved = flatTokens.get(match[1]);
  if (resolved === undefined) {
    console.warn(`Unresolved alias: ${value}`);
    return value;
  }
  if (typeof resolved === 'string' && resolved.startsWith('{')) {
    return resolveAlias(resolved, flatTokens);
  }
  return resolved;
}

function collectTokens(
  obj: Record<string, unknown>,
  path: string[],
  inheritedType: string | undefined,
  result: Map<string, { value: unknown; type: string | undefined; groupPath: string[] }>,
): void {
  const currentType = (obj.$type as string | undefined) ?? inheritedType;

  for (const [key, val] of Object.entries(obj)) {
    if (key.startsWith('$') || key === 'name' || key === 'description') continue;
    if (typeof val !== 'object' || val === null) continue;

    const record = val as Record<string, unknown>;
    if (isToken(record)) {
      const tokenType = (record.$type as string | undefined) ?? currentType;
      result.set([...path, key].join('.'), {
        value: record.$value,
        type: tokenType,
        groupPath: path,
      });
    } else {
      collectTokens(record, [...path, key], currentType, result);
    }
  }
}

export const dtcgParser: ParserPlugin = {
  name: 'dtcg',
  extensions: ['.json'],

  detect(filePath: string): boolean {
    if (!filePath.endsWith('.json')) return false;
    const content = readFileSync(filePath, 'utf-8');
    return content.includes('"$value"');
  },

  parse(filePath: string): DesignTokenSet {
    const raw = JSON.parse(readFileSync(filePath, 'utf-8'));
    const name = raw.name ?? basename(filePath, '.json');

    const flatTokens = new Map<string, { value: unknown; type: string | undefined; groupPath: string[] }>();
    collectTokens(raw, [], undefined, flatTokens);

    const rawValues = new Map<string, unknown>();
    for (const [path, token] of flatTokens) {
      rawValues.set(path, token.value);
    }

    const colors: Record<string, string> = {};
    const typography: Record<string, TypographyToken> = {};
    const spacing: Record<string, string> = {};
    const rounded: Record<string, string> = {};

    for (const [path, token] of flatTokens) {
      const tokenName = path.split('.').pop()!;
      const topGroup = token.groupPath[0] ?? '';

      if (token.type === 'color') {
        let value = token.value;
        if (typeof value === 'string' && value.startsWith('{')) {
          value = resolveAlias(value, rawValues);
        }
        const hex = normalizeColor(String(value));
        if (hex) colors[tokenName] = hex;

      } else if (token.type === 'dimension') {
        const value = typeof token.value === 'string' && token.value.startsWith('{')
          ? String(resolveAlias(token.value, rawValues))
          : String(token.value);

        if (ROUNDED_GROUP_NAMES.has(topGroup)) {
          rounded[tokenName] = value;
        } else {
          spacing[tokenName] = value;
        }

      } else if (token.type === 'typography') {
        const value = token.value as Record<string, unknown>;
        const typoToken: TypographyToken = {};
        if (value.fontFamily) typoToken.fontFamily = String(value.fontFamily);
        if (value.fontSize) typoToken.fontSize = String(value.fontSize);
        if (value.fontWeight) typoToken.fontWeight = Number(value.fontWeight);
        if (value.lineHeight) {
          typoToken.lineHeight = typeof value.lineHeight === 'number'
            ? value.lineHeight
            : String(value.lineHeight);
        }
        if (value.letterSpacing) typoToken.letterSpacing = String(value.letterSpacing);
        typography[tokenName] = typoToken;

      } else {
        console.warn(`Skipped ${path}: unsupported type "${token.type}"`);
      }
    }

    const result: DesignTokenSet = { name };
    if (Object.keys(colors).length > 0) result.colors = colors;
    if (Object.keys(typography).length > 0) result.typography = typography;
    if (Object.keys(spacing).length > 0) result.spacing = spacing;
    if (Object.keys(rounded).length > 0) result.rounded = rounded;
    return result;
  },
};
