#!/usr/bin/env node

/**
 * Translation Completeness Checker
 *
 * Compares English and French translation JSON files across all namespaces
 * and reports missing keys in either language.
 *
 * Usage: node scripts/check-translations.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.resolve(__dirname, '..', 'public', 'locales');
const LANGUAGES = ['en', 'fr'];
const REFERENCE_LANG = 'en';

function flattenObject(obj, prefix = '') {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, fullKey));
    } else {
      result[fullKey] = value;
    }
  }
  return result;
}

function loadNamespaces(lang) {
  const dir = path.join(LOCALES_DIR, lang);
  if (!fs.existsSync(dir)) {
    console.error(`Directory not found: ${dir}`);
    process.exit(1);
  }
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
  const result = {};
  for (const file of files) {
    const ns = path.basename(file, '.json');
    const content = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    result[ns] = flattenObject(content);
  }
  return result;
}

// ── Main ──

let totalMissing = 0;
let totalKeys = 0;

const allNamespaces = new Set();
const langData = {};

for (const lang of LANGUAGES) {
  langData[lang] = loadNamespaces(lang);
  Object.keys(langData[lang]).forEach((ns) => allNamespaces.add(ns));
}

console.log('╔══════════════════════════════════════════════════╗');
console.log('║       Translation Completeness Report           ║');
console.log('╚══════════════════════════════════════════════════╝\n');

for (const ns of [...allNamespaces].sort()) {
  const refKeys = langData[REFERENCE_LANG]?.[ns] || {};
  const refKeySet = new Set(Object.keys(refKeys));
  totalKeys += refKeySet.size;

  let nsMissing = 0;
  const issues = [];

  for (const lang of LANGUAGES) {
    if (lang === REFERENCE_LANG) continue;
    const langKeys = langData[lang]?.[ns] || {};
    const langKeySet = new Set(Object.keys(langKeys));

    // Keys in reference but missing in this language
    for (const key of refKeySet) {
      if (!langKeySet.has(key)) {
        issues.push({ lang, key, type: 'missing' });
        nsMissing++;
      }
    }

    // Keys in this language but not in reference (extra)
    for (const key of langKeySet) {
      if (!refKeySet.has(key)) {
        issues.push({ lang, key, type: 'extra' });
      }
    }
  }

  // Also check if reference itself is missing a namespace that another lang has
  for (const lang of LANGUAGES) {
    if (lang === REFERENCE_LANG) continue;
    if (langData[lang]?.[ns] && !langData[REFERENCE_LANG]?.[ns]) {
      issues.push({ lang: REFERENCE_LANG, key: '*', type: 'namespace missing' });
    }
  }

  const status = nsMissing === 0 ? '✅' : '❌';
  console.log(`${status} ${ns} (${refKeySet.size} keys)`);

  if (issues.length > 0) {
    for (const issue of issues) {
      const icon = issue.type === 'missing' ? '  ⚠️  MISSING' : '  ℹ️  EXTRA  ';
      console.log(`   ${icon} [${issue.lang}] ${issue.key}`);
    }
  }

  totalMissing += nsMissing;
}

console.log('\n──────────────────────────────────────────────────');
console.log(`Total reference keys: ${totalKeys}`);
console.log(`Missing translations: ${totalMissing}`);
console.log(
  `Completeness: ${((1 - totalMissing / Math.max(totalKeys, 1)) * 100).toFixed(1)}%`
);

if (totalMissing > 0) {
  console.log('\n⚠️  Some translations are missing. Run this script after adding new keys.');
  process.exit(1);
} else {
  console.log('\n🎉 All translations are complete!');
  process.exit(0);
}
