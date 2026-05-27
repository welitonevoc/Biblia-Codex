import { readFileSync, writeFileSync } from 'fs';
import { globSync } from 'glob';
import { oklch, oklab, rgb, interpolate, formatRgb } from 'culori';

function findMatchingParen(str, start) {
  let depth = 0;
  let i = start;
  do {
    if (str[i] === '(') depth++;
    if (str[i] === ')') depth--;
    i++;
  } while (depth > 0 && i < str.length);
  return i;
}

function splitArgs(inner) {
  const args = [];
  let current = '';
  let depth = 0;
  for (const ch of inner) {
    if (ch === ',' && depth === 0) {
      args.push(current.trim());
      current = '';
    } else {
      current += ch;
      if (ch === '(') depth++;
      if (ch === ')') depth--;
    }
  }
  if (current.trim()) args.push(current.trim());
  return args;
}

function resolveVar(name, customProperties, visited = new Set()) {
  if (visited.has(name)) return null;
  visited.add(name);
  const value = customProperties.get(name);
  if (!value) return null;
  const varMatch = value.match(/^var\(\s*--([^)\s]+)\s*\)$/);
  if (varMatch) return resolveVar(`--${varMatch[1]}`, customProperties, visited);
  return value;
}

function tryParseColor(value, customProperties) {
  const trimmed = value.trim();
  if (trimmed === 'transparent') return 'rgba(0,0,0,0)';
  if (trimmed === 'currentcolor' || trimmed === 'currentColor') return null;

  const varMatch = trimmed.match(/^var\(\s*--([^)\s]+)\s*\)$/);
  if (varMatch) {
    const resolved = resolveVar(`--${varMatch[1]}`, customProperties);
    if (resolved) return tryParseColor(resolved, customProperties);
    return null;
  }

  try {
    const parsed = rgb(trimmed);
    if (parsed && !isNaN(parsed.r)) return formatRgb(parsed);
  } catch { }
  try {
    const parsed = oklch(trimmed);
    if (parsed && !isNaN(parsed.l)) return formatRgb(parsed);
  } catch { }
  try {
    const parsed = oklab(trimmed);
    if (parsed && !isNaN(parsed.l)) return formatRgb(parsed);
  } catch { }

  return null;
}

function collectCustomProperties(css) {
  const props = new Map();
  const regex = /--[\w-]+\s*:\s*/g;
  let match;
  while ((match = regex.exec(css)) !== null) {
    const colonIdx = css.indexOf(':', match.index);
    const name = css.slice(match.index, colonIdx).trim();
    let valueStart = colonIdx + 1;
    while (valueStart < css.length && css[valueStart] === ' ') valueStart++;
    let parenDepth = 0;
    let valueEnd = valueStart;
    for (let i = valueStart; i < css.length; i++) {
      if (css[i] === '(') parenDepth++;
      if (css[i] === ')') parenDepth--;
      if (css[i] === ';' && parenDepth === 0) { valueEnd = i; break; }
      if (css[i] === '{' || css[i] === '}') { valueEnd = i; break; }
    }
    if (valueEnd <= valueStart) continue;
    const value = css.slice(valueStart, valueEnd).trim();
    props.set(name, value);
    regex.lastIndex = valueEnd;
  }
  return props;
}

function replaceAll(css, regex, fn) {
  let result = css;
  const matches = [];
  let m;
  while ((m = regex.exec(result)) !== null) {
    const start = m.index;
    const end = findMatchingParen(result, start + m[0].indexOf('('));
    matches.push({ start, end, raw: result.slice(start, end) });
    regex.lastIndex = end;
  }
  for (let i = matches.length - 1; i >= 0; i--) {
    const { start, end, raw } = matches[i];
    const fixed = fn(raw);
    if (fixed !== raw) {
      result = result.slice(0, start) + fixed + result.slice(end);
    }
  }
  return result;
}

function processCss(css) {
  let result = css;
  const customProperties = collectCustomProperties(result);

  // Replace oklch() values
  result = replaceAll(result, /(?<![-\w])oklch\s*\(/gi, (raw) => {
    try {
      const parsed = oklch(raw);
      if (parsed && !isNaN(parsed.l)) return formatRgb(parsed);
    } catch { }
    return raw;
  });

  // Replace oklab() values  
  result = replaceAll(result, /(?<![-\w])oklab\s*\(/gi, (raw) => {
    try {
      const parsed = oklab(raw);
      if (parsed && !isNaN(parsed.l)) return formatRgb(parsed);
    } catch { }
    return raw;
  });

  // Replace color-mix(in oklab, ...)
  result = replaceAll(result, /color-mix\s*\(/gi, (raw) => {
    const innerStart = raw.indexOf('(') + 1;
    const inner = raw.slice(innerStart, raw.length - 1).trim();
    const spaceMatch = inner.match(/^in\s+(oklch|oklab|srgb|srgb-linear|display-p3|rec2020|hsl|hwb|lch|lab)\s*,\s*/i);
    if (!spaceMatch) return raw;
    const space = spaceMatch[1].toLowerCase();
    if (space !== 'oklab' && space !== 'oklch') return raw;

    const afterSpace = inner.slice(spaceMatch[0].length).trim();
    const args = splitArgs(afterSpace);
    if (args.length < 2) return raw;

    let color1Str = args[0];
    let color2Str = args[1];
    let pct1, pct2;

    const pctMatch1 = color1Str.match(/^(.+?)\s+(\d+(?:\.\d+)?)%$/);
    if (pctMatch1) { color1Str = pctMatch1[1].trim(); pct1 = parseFloat(pctMatch1[2]); }
    const pctMatch2 = color2Str.match(/^(.+?)\s+(\d+(?:\.\d+)?)%$/);
    if (pctMatch2) { color2Str = pctMatch2[1].trim(); pct2 = parseFloat(pctMatch2[2]); }

    // Resolve nested color-mix first
    if (color1Str.toLowerCase().startsWith('color-mix(')) {
      const resolved = processCss(color1Str);
      color1Str = resolved;
    }
    if (color2Str.toLowerCase().startsWith('color-mix(')) {
      const resolved = processCss(color2Str);
      color2Str = resolved;
    }

    const c1 = tryParseColor(color1Str, customProperties);
    const c2 = tryParseColor(color2Str, customProperties);
    if (!c1 || !c2) return raw;

    if (pct1 === undefined && pct2 === undefined) { pct1 = 50; pct2 = 50; }
    else if (pct1 !== undefined && pct2 === undefined) { pct2 = 100 - pct1; }
    else if (pct1 === undefined && pct2 !== undefined) { pct1 = 100 - pct2; }

    try {
      const col1 = oklch(c1) || oklab(c1) || rgb(c1);
      const col2 = oklch(c2) || oklab(c2) || rgb(c2);
      if (col1 && col2 && !isNaN(col1.l) && !isNaN(col2.l)) {
        const interp = interpolate([col1, col2], 'oklab');
        const mixed = interp((pct2 ?? 50) / 100);
        if (mixed) return formatRgb(mixed);
      }
    } catch { }
    return raw;
  });

  return result;
}

// Main
const distDir = process.argv[2] || 'dist/assets';
const files = globSync(`${distDir}/*.css`);
for (const file of files) {
  console.log(`Processing ${file}...`);
  const css = readFileSync(file, 'utf-8');
  const fixed = processCss(css);
  if (fixed !== css) {
    writeFileSync(file, fixed, 'utf-8');
    const oklchCount = (css.match(/oklch/gi) || []).length;
    const oklabCount = (css.match(/oklab/gi) || []).length;
    const colorMixCount = (css.match(/color-mix\s*\(\s*in\s+oklab/gi) || []).length;
    console.log(`  Fixed: ${oklchCount} oklch(), ${oklabCount} oklab(), ${colorMixCount} color-mix(in oklab, ...)`);
  } else {
    console.log(`  No changes needed.`);
  }
}
