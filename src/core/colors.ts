import { parse, formatHex, formatHex8 } from 'culori';

const SAFE_MODES = new Set(['rgb', 'hsl', 'hwb', 'hsv']);

export function normalizeColor(value: string): string | null {
  if (value.startsWith('var(') || value.startsWith('calc(')) {
    return null;
  }

  const parsed = parse(value);
  if (!parsed) return null;

  if (!SAFE_MODES.has(parsed.mode)) {
    return null;
  }

  if (parsed.alpha !== undefined && parsed.alpha < 1) {
    return formatHex8(parsed);
  }
  return formatHex(parsed);
}
