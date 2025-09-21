const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const srcDir = path.join(repoRoot, 'src');
const translationsPath = path.join(repoRoot, 'src', 'lib', 'translations.ts');
const outPath = path.join(repoRoot, 'translation_missing_keys.json');

function readAllFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files = files.concat(readAllFiles(full));
    else if (/\.(ts|tsx|js|jsx)$/i.test(e.name)) files.push(full);
  }
  return files;
}

function extractUsedKeysFromFile(content) {
  const keys = new Set();
  const regex = /t\((?:'|\")([^'\"]+)(?:'|\")\)/g;
  let m;
  while ((m = regex.exec(content)) !== null) {
    keys.add(m[1]);
  }
  return keys;
}

function parseTranslationsObject(tsContent) {
  // locate the start of the object literal after "export const translations ="
  const marker = 'export const translations =';
  const idx = tsContent.indexOf(marker);
  if (idx === -1) return null;
  const start = tsContent.indexOf('{', idx);
  // find the start of "export const getTranslation" to mark end
  const getTranslationIdx = tsContent.indexOf('\n\nexport const getTranslation');
  let end;
  if (getTranslationIdx !== -1) {
    end = tsContent.lastIndexOf('}', getTranslationIdx);
  } else {
    end = tsContent.lastIndexOf('}');
  }
  const objText = tsContent.slice(start, end + 1);
  // naive JS-eval: convert trailing commas and keep strings as-is
  try {
    // Wrap in parens to evaluate as expression
    const obj = Function('return ' + objText)();
    return obj;
  } catch (err) {
    console.error('Failed to evaluate translations object:', err.message);
    return null;
  }
}

function hasKey(obj, dottedKey) {
  if (!obj) return false;
  const parts = dottedKey.split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in cur) cur = cur[p];
    else return false;
  }
  return true;
}

// Read translations file
const ts = fs.readFileSync(translationsPath, 'utf8');
const translationsObj = parseTranslationsObject(ts);
if (!translationsObj) process.exit(2);

// Collect used keys
const files = readAllFiles(srcDir);
const usedKeys = new Set();
for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const ks = extractUsedKeysFromFile(content);
  ks.forEach(k => usedKeys.add(k));
}

// Compare
const missing = [];
for (const key of Array.from(usedKeys).sort()) {
  const ok = hasKey(translationsObj.fr, key) || hasKey(translationsObj.en, key) || hasKey(translationsObj.ar, key);
  if (!ok) missing.push(key);
}

fs.writeFileSync(outPath, JSON.stringify({ missing, count: missing.length }, null, 2), 'utf8');
console.log('Checked', usedKeys.size, 'unique translation usages.');
console.log('Missing keys count:', missing.length);
if (missing.length > 0) console.log('First missing keys:', missing.slice(0, 20));
console.log('Wrote', outPath);
process.exit(0);
