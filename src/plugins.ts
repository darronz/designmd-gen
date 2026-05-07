import { readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import type { ParserPlugin } from './core/types.js';
import { cssParser } from './parsers/css.js';
import { dtcgParser } from './parsers/dtcg.js';
import { styleDictionaryParser } from './parsers/style-dictionary.js';
import { tailwindParser } from './parsers/tailwind.js';

const require = createRequire(import.meta.url);

const BUILTIN_PLUGINS: ParserPlugin[] = [
  cssParser,
  dtcgParser,
  tailwindParser,
  styleDictionaryParser,
];

const registeredPlugins: ParserPlugin[] = [];

export function registerPlugin(plugin: ParserPlugin): void {
  registeredPlugins.push(plugin);
}

export function getBuiltinPlugins(): ParserPlugin[] {
  return [...BUILTIN_PLUGINS];
}

export function discoverCommunityPlugins(): ParserPlugin[] {
  const plugins: ParserPlugin[] = [];
  try {
    const nodeModules = join(process.cwd(), 'node_modules');
    const entries = readdirSync(nodeModules, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('designmd-gen-plugin-') && entry.isDirectory()) {
        try {
          const mod = require(join(nodeModules, entry.name));
          const plugin = mod.default ?? mod;
          if (plugin.name && plugin.parse && plugin.detect) {
            plugins.push(plugin as ParserPlugin);
          }
        } catch {
          // skip broken plugins
        }
      }
    }
  } catch {
    // node_modules not found
  }
  return plugins;
}

export function getAllPlugins(): ParserPlugin[] {
  return [...registeredPlugins, ...BUILTIN_PLUGINS, ...discoverCommunityPlugins()];
}

export function resolveParser(filePath: string, parserName?: string): ParserPlugin {
  const plugins = getAllPlugins();

  if (parserName) {
    const found = plugins.find((p) => p.name === parserName);
    if (!found) {
      throw new Error(
        `Unknown parser "${parserName}". Available: ${plugins.map((p) => p.name).join(', ')}`,
      );
    }
    return found;
  }

  const matches = plugins.filter((p) => p.detect(filePath));
  if (matches.length === 0) {
    throw new Error(
      `No parser found for "${filePath}". Use --parser to specify one. Available: ${plugins.map((p) => p.name).join(', ')}`,
    );
  }
  if (matches.length > 1) {
    throw new Error(
      `Multiple parsers match "${filePath}": ${matches.map((p) => p.name).join(', ')}. Use --parser to pick one.`,
    );
  }
  return matches[0];
}
