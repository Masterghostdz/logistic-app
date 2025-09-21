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
    const k = m[1].trim();
    // Only keep dot-separated keys like namespace.key or namespace.sub.key
    if (/^[A-Za-z][A-Za-z0-9_]*(?:\.[A-Za-z0-9_]+)+$/.test(k)) keys.add(k);
  }
  return keys;
}

function findBlock(content, key) {
  const regex = new RegExp(key + '\\s*:\\s*\\{', 'm');
  const m = regex.exec(content);
  if (!m) return null;
  const start = m.index + m[0].indexOf('{');
  let depth = 0;
  for (let i = start; i < content.length; i++) {
    const ch = content[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return content.slice(start + 1, i); // inside braces
    }
  }
  return null;
}

function hasKeyByText(tsContent, dottedKey) {
  const parts = dottedKey.split('.');
  let currentBlock = tsContent;
  // translations variable is at top-level; narrow to fr/en/ar blocks first
  const topLang = parts[0];
  if (['fr', 'en', 'ar'].includes(topLang)) {
    // direct language key usage like 'fr.something' unlikely; handle generic usage by searching in each lang
  }
  // We'll search for the key path inside each language block
  for (const lang of ['fr', 'en', 'ar']) {
    let block = findBlock(tsContent, lang);
    if (!block) continue;
    let ok = true;
    let subBlock = block;
    for (const p of parts) {
      // for each part, if p exists as sub-block or as key:value
      const subRegex = new RegExp('(^|[\n\r\t ])' + p + '\\s*:\\s*\\{', 'm');
      const valRegex = new RegExp('(^|[\n\r\t ])' + p + "\\s*:\\s*([\"'])", 'm');
      const subMatch = subRegex.exec(subBlock);
      const valMatch = valRegex.exec(subBlock);
      if (subMatch) {
        // descend into sub-block
        const next = findBlock(subBlock, p);
        if (!next) { ok = false; break; }
        subBlock = next;
      } else if (valMatch) {
        // found a value for this key; if this is the last part, ok, else not found
        if (p !== parts[parts.length - 1]) { ok = false; }
        break;
      } else {
        ok = false; break;
      }
    }
    if (ok) return true;
  }
  return false;
}

const ts = fs.readFileSync(translationsPath, 'utf8');

const files = readAllFiles(srcDir);
const usedKeys = new Set();
for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const ks = extractUsedKeysFromFile(content);
  ks.forEach(k => usedKeys.add(k));
}

const missing = [];
for (const key of Array.from(usedKeys).sort()) {
  const ok = hasKeyByText(ts, key);
  if (!ok) missing.push(key);
}

fs.writeFileSync(outPath, JSON.stringify({ missing, count: missing.length }, null, 2), 'utf8');
console.log('Checked', usedKeys.size, 'unique translation usages.');
console.log('Missing keys count:', missing.length);
if (missing.length > 0) console.log('First missing keys:', missing.slice(0, 20));
console.log('Wrote', outPath);
process.exit(0);
