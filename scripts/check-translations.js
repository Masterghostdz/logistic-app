const fs = require('fs');
const path = require('path');

function walk(dir, exts = ['.ts', '.tsx', '.js', '.jsx']) {
  const res = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.git') continue;
      res.push(...walk(p, exts));
    } else {
      if (exts.includes(path.extname(e.name))) res.push(p);
    }
  }
  return res;
}

// 1) collect keys
const root = path.join(__dirname, '..');
const src = path.join(root, 'src');
const files = walk(src);
const keyRe = /t\(\s*['\"]([^'\"]+)['\"]\s*\)/g;
const keys = new Set();
for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  let m;
  while ((m = keyRe.exec(content)) !== null) {
    keys.add(m[1]);
  }
}

const keyList = Array.from(keys).sort();
console.log('Found', keyList.length, 'unique translation keys');

// 2) parse translations object from src/lib/translations.ts
const translationsPath = path.join(src, 'lib', 'translations.ts');
if (!fs.existsSync(translationsPath)) {
  console.error('translations.ts not found at', translationsPath);
  process.exit(1);
}
const translationsText = fs.readFileSync(translationsPath, 'utf8');
const marker = 'export const translations';
const idx = translationsText.indexOf(marker);
if (idx === -1) {
  console.error('Could not find "export const translations" in translations.ts');
  process.exit(1);
}
const start = translationsText.indexOf('{', idx);
if (start === -1) {
  console.error('Could not find opening { for translations object');
  process.exit(1);
}

// find matching closing brace
let i = start;
let depth = 0;
let end = -1;
for (; i < translationsText.length; i++) {
  const ch = translationsText[i];
  if (ch === '{') depth++;
  else if (ch === '}') {
    depth--;
    if (depth === 0) { end = i; break; }
  }
}
if (end === -1) {
  console.error('Could not find end of translations object');
  process.exit(1);
}
const objText = translationsText.slice(start, end + 1);

// Evaluate safely using vm in a new context
const vm = require('vm');
let translations;
try {
  const script = new vm.Script('(' + objText + ')');
  translations = script.runInNewContext({});
} catch (e) {
  console.error('Failed to evaluate translations object:', e.message);
  process.exit(1);
}

const languages = Object.keys(translations);
console.log('Languages found in translations object:', languages.join(', '));

function lookup(key, lang) {
  const parts = key.split('.');
  let cur = translations[lang];
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in cur) cur = cur[p];
    else return undefined;
  }
  return cur;
}

const missing = {};
for (const lang of languages) missing[lang] = [];
for (const k of keyList) {
  for (const lang of languages) {
    const v = lookup(k, lang);
    if (v === undefined) missing[lang].push(k);
  }
}

const report = { totalKeys: keyList.length, languages, missing };
const outPath = path.join(root, 'translation-report.json');
fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
console.log('Report written to', outPath);
console.log('Summary:');
for (const lang of languages) console.log(`  ${lang}: ${missing[lang].length} missing keys`);

process.exit(0);
