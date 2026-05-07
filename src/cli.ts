#!/usr/bin/env node

import { Command } from 'commander';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from './index.js';
import { mergeTokenSets } from './core/merge.js';
import { serialize } from './core/serialize.js';
import { validate } from './core/validate.js';
import { registerPlugin } from './plugins.js';
import { loadConfig } from './config.js';
import type { DesignTokenSet } from './core/types.js';

const program = new Command();

program
  .name('designmd-gen')
  .description('Export DESIGN.md from existing design token sources')
  .version('0.1.0')
  .argument('[files...]', 'Input files to parse')
  .option('-c, --config <path>', 'Path to config file')
  .option('-p, --parser <name>', 'Force a specific parser')
  .option('-n, --name <name>', 'Set the design system name')
  .option('-o, --out <path>', 'Output path')
  .option('--no-lint', 'Skip validation against @google/design.md linter')
  .option('--dry-run', 'Print generated YAML to stdout without writing')
  .action(async (files: string[], options) => {
    try {
      const config = loadConfig(options.config);

      if (config?.parser) {
        registerPlugin(config.parser);
      }

      const inputFiles = files.length > 0 ? files : config?.input;
      if (!inputFiles || inputFiles.length === 0) {
        console.error('Error: No input files. Provide files as arguments or set "input" in designmd-gen.config.ts');
        process.exit(1);
      }

      const parserName = options.parser ?? (config?.parser ? config.parser.name : undefined);
      const tokenSets: DesignTokenSet[] = inputFiles.map((file: string) =>
        parse(resolve(file), parserName),
      );

      const merged = mergeTokenSets(tokenSets);

      const name = options.name ?? config?.name;
      if (name) {
        merged.name = name;
      }

      const hasTokens =
        merged.colors ||
        merged.typography ||
        merged.rounded ||
        merged.spacing ||
        merged.components;

      if (!hasTokens) {
        console.error('Error: No tokens extracted from input files.');
        process.exit(1);
      }

      const output = serialize(merged);

      const shouldLint = options.lint && (config?.lint !== false);
      if (shouldLint) {
        const result = validate(output);
        for (const warning of result.warnings) {
          console.warn(`Warning: ${warning}`);
        }
        if (!result.valid) {
          for (const error of result.errors) {
            console.error(`Error: ${error}`);
          }
          console.error('\nValidation failed. Use --no-lint to skip.');
          process.exit(1);
        }
      }

      if (options.dryRun) {
        process.stdout.write(output);
      } else {
        const outPath = resolve(options.out ?? config?.out ?? 'DESIGN.md');
        writeFileSync(outPath, output, 'utf-8');
        console.log(`Written to ${outPath}`);
      }
    } catch (err) {
      console.error(`Error: ${(err as Error).message}`);
      process.exit(1);
    }
  });

program.parse();
