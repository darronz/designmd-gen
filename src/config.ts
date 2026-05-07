import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { createJiti } from 'jiti';
import type { DesignMdConfig } from './core/types.js';

const CONFIG_FILENAMES = [
  'designmd-gen.config.ts',
  'designmd-gen.config.js',
  'designmd-gen.config.mjs',
];

export function loadConfig(configPath?: string): DesignMdConfig | null {
  if (configPath) {
    const absPath = resolve(configPath);
    if (!existsSync(absPath)) {
      throw new Error(`Config file not found: ${absPath}`);
    }
    return loadFile(absPath);
  }

  for (const filename of CONFIG_FILENAMES) {
    const absPath = resolve(process.cwd(), filename);
    if (existsSync(absPath)) {
      return loadFile(absPath);
    }
  }

  return null;
}

function loadFile(absPath: string): DesignMdConfig {
  const jiti = createJiti(absPath);
  const mod = jiti(absPath) as Record<string, unknown>;
  return (mod.default ?? mod) as DesignMdConfig;
}
