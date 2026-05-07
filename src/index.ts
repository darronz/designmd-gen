export type { DesignTokenSet, DesignMdConfig, ParserPlugin, TypographyToken } from './core/types.js';
export { serialize } from './core/serialize.js';
export { mergeTokenSets } from './core/merge.js';
export { validate } from './core/validate.js';
export { normalizeColor } from './core/colors.js';
export { resolveParser, getBuiltinPlugins, getAllPlugins, registerPlugin } from './plugins.js';
export { loadConfig } from './config.js';

import { resolveParser } from './plugins.js';
import type { DesignTokenSet } from './core/types.js';

export function parse(filePath: string, parserName?: string): DesignTokenSet {
  const parser = resolveParser(filePath, parserName);
  return parser.parse(filePath);
}
