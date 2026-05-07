# designmd-gen

[![npm version](https://img.shields.io/npm/v/@darronz/designmd-gen)](https://www.npmjs.com/package/@darronz/designmd-gen)

Export a [DESIGN.md](https://github.com/nicholasgasior/design.md) file from your existing design tokens. Takes CSS custom properties, W3C DTCG JSON, Tailwind configs, or Style Dictionary JSON and produces the YAML frontmatter format that DESIGN.md expects.

## Install

```bash
npm install @darronz/designmd-gen
```

## Quick start

```bash
# From a CSS file with standard naming (--color-*, --spacing-*, etc.)
designmd-gen tokens.css --name "My System"

# From a Tailwind config
designmd-gen tailwind.config.ts --name "My System"

# From multiple sources (merged, later files win conflicts)
designmd-gen tokens.css brand-colors.json --name "My System"

# Preview without writing
designmd-gen tokens.css --name "My System" --dry-run --no-lint
```

## CLI

```
designmd-gen [options] [files...]

Options:
  -c, --config <path>  Path to config file
  -p, --parser <name>  Force a specific parser (css, dtcg, tailwind, style-dictionary)
  -n, --name <name>    Set the design system name
  -o, --out <path>     Output path (default: DESIGN.md)
  --no-lint            Skip validation against @google/design.md linter
  --dry-run            Print to stdout without writing a file
```

## Programmatic API

```ts
import { parse, serialize, mergeTokenSets } from '@darronz/designmd-gen';

const tokens = parse('tokens.css');
const yaml = serialize(tokens);

// Or merge multiple sources
const css = parse('tokens.css');
const brand = parse('brand.json', 'dtcg');
const merged = mergeTokenSets([css, brand]);
const output = serialize(merged);
```

## Built-in parsers

| Parser | Detects | Maps to DESIGN.md |
|--------|---------|-------------------|
| `css` | `.css` files | `--color-*` to colors, `--font-{group}-{prop}` to typography, `--spacing-*` to spacing, `--radius-*` to rounded |
| `dtcg` | `.json` with `$value` keys | `$type: "color"` to colors, `"dimension"` to spacing/rounded, `"typography"` to typography. Resolves aliases. |
| `style-dictionary` | `.json` with `value` keys (no `$` prefix) | Same mapping as DTCG but for the older Style Dictionary format |
| `tailwind` | `tailwind.config.*` | `theme.colors` to colors, `theme.fontSize`/`theme.fontFamily` to typography, `theme.spacing` to spacing, `theme.borderRadius` to rounded |

## Config file

Create a `designmd-gen.config.ts` in your project root to set defaults and register a custom parser:

```ts
import { myParser } from './src/tokens/mapper.ts';

export default {
  name: 'My Design System',
  parser: myParser,
  input: ['src/styles/global.css'],
  out: 'DESIGN.md',
};
```

With a config file, run with no arguments:

```bash
designmd-gen --dry-run
```

The CLI merges config with command-line flags. Flags take precedence.

## Custom mappers

The built-in CSS parser uses prefix-based naming conventions (`--color-*`, `--spacing-*`) to categorize tokens. Real projects rarely follow these conventions. A project might use `--bg-*` for background colors, `--accent-*` for brand colors, `--space-*` for spacing, or any other naming scheme.

A custom mapper is a `ParserPlugin` that understands your project's specific naming conventions. It reads your CSS (or any source), knows which variables are colors, which are typography, and which are spacing, and returns a structured `DesignTokenSet`.

The mapper lives in your project, not in designmd-gen. The config file points to it.

### ParserPlugin interface

```ts
type ParserPlugin = {
  name: string;
  extensions: string[];
  detect(filePath: string): boolean;
  parse(filePath: string): DesignTokenSet;
};

type DesignTokenSet = {
  name: string;
  description?: string;
  colors?: Record<string, string>;
  typography?: Record<string, TypographyToken>;
  rounded?: Record<string, string>;
  spacing?: Record<string, string | number>;
  components?: Record<string, Record<string, string>>;
};
```

### Using an LLM to generate the mapper

Mapping arbitrary CSS variable names to design token categories is a classification problem. There is no universal naming convention, so a deterministic parser can't reliably categorize tokens from an unfamiliar codebase. But the classification itself is straightforward for an LLM — it can read the variable names, values, and surrounding comments and make the same judgment calls a designer would.

Point an LLM at your project and ask it to generate the mapper:

```
Look at the CSS custom properties in this project. I need a custom mapper
for designmd-gen that categorizes these tokens into a DESIGN.md file.

Find all CSS files that define custom properties (in :root or html selectors)
and generate a TypeScript file that exports a ParserPlugin.

Classify each variable by examining its name, value, and surrounding comments:
- Color values (hex, rgb, rgba, hsl, named colors) go in `colors`
- Font family stacks and font size/weight/line-height go in `typography`
- Spacing scale values go in `spacing`
- Border radius values go in `rounded`
- Use the variable name (minus the -- prefix) as the token key
- Normalize hex values to lowercase 6-digit format
- Handle rgba() by including the alpha as 8-digit hex

The file should be self-contained (inline types, use postcss for parsing)
and export the parser as a named export.

Here is the ParserPlugin interface the file must implement:

type ParserPlugin = {
  name: string;
  extensions: string[];
  detect(filePath: string): boolean;
  parse(filePath: string): DesignTokenSet;
};

type DesignTokenSet = {
  name: string;
  description?: string;
  colors?: Record<string, string>;
  typography?: Record<string, TypographyToken>;
  rounded?: Record<string, string>;
  spacing?: Record<string, string | number>;
  components?: Record<string, Record<string, string>>;
};

type TypographyToken = {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: number;
  lineHeight?: string | number;
  letterSpacing?: string;
};

Save the mapper to src/tokens/mapper.ts and create a designmd-gen.config.ts
in the project root that imports it.
```

The LLM reads your codebase, finds the token definitions, classifies them, and generates both the mapper and config file. From there the mapper runs without an LLM — it's just a TypeScript file. If your tokens change, regenerate the mapper.

The LLM does the one-time classification work and produces deterministic code. From there, the mapper runs without an LLM — it's just a TypeScript file. If your tokens change, regenerate the mapper.

## Token merging

When multiple input files are provided, their tokens are merged. Later files override earlier ones for conflicting token names, with a warning printed to stderr.

```bash
designmd-gen base-tokens.css brand-overrides.css --name "My System"
```

## Validation

By default, the output is validated against the `@google/design.md` linter. Warnings are printed but don't block output. Errors block output and exit non-zero. Use `--no-lint` to skip validation.

## License

MIT
