import { stringify } from 'yaml';
import type { DesignTokenSet } from './types.js';

const KEY_ORDER: (keyof DesignTokenSet)[] = [
  'name',
  'description',
  'colors',
  'typography',
  'rounded',
  'spacing',
  'components',
];

export function serialize(tokens: DesignTokenSet): string {
  const ordered: Record<string, unknown> = {};
  for (const key of KEY_ORDER) {
    if (tokens[key] !== undefined) {
      ordered[key] = tokens[key];
    }
  }
  return `---\n${stringify(ordered)}---\n`;
}
