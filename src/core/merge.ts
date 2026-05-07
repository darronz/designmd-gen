import type { DesignTokenSet } from './types.js';

type SectionKey = 'colors' | 'typography' | 'rounded' | 'spacing' | 'components';
const SECTION_KEYS: SectionKey[] = ['colors', 'typography', 'rounded', 'spacing', 'components'];

export function mergeTokenSets(sets: DesignTokenSet[]): DesignTokenSet {
  if (sets.length === 0) {
    throw new Error('No token sets to merge');
  }
  if (sets.length === 1) {
    return sets[0];
  }

  const result: DesignTokenSet = { name: sets[sets.length - 1].name };
  const lastDescription = sets.findLast((s: DesignTokenSet) => s.description)?.description;
  if (lastDescription) {
    result.description = lastDescription;
  }

  for (const key of SECTION_KEYS) {
    const merged: Record<string, unknown> = {};
    let hasValues = false;

    for (const set of sets) {
      const section = set[key];
      if (!section) continue;
      for (const [token, value] of Object.entries(section)) {
        if (token in merged) {
          console.warn(`Token "${token}" in ${key} overridden by later file`);
        }
        merged[token] = value;
        hasValues = true;
      }
    }

    if (hasValues) {
      (result as unknown as Record<string, unknown>)[key] = merged;
    }
  }

  return result;
}
