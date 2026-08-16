#!/usr/bin/env node
// Checks packages/near-api-ts/universal/src against skills/module-placement/SKILL.md.
//
// Four checks, all derived from the value-import graph:
//   barrel        — a src module imports from the package index.ts
//   encapsulation — a value import reaches into a module folder's interior or a _common chain
//   placement     — Rule 1 (ownership) + Rule 2 (layer depth)
//   layering      — a _common module imports from an equal-or-shallower layer of the same owner
//
// Known non-conformances live in scripts/modulePlacement.allow.json. An entry that no
// longer matches a finding is itself an error, so the allowlist deletes itself as the
// tree is fixed.
//
// Usage: node scripts/checkModulePlacement.mjs [--json] [--list]

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const PKG = path.join(ROOT, 'packages/near-api-ts/universal');
const ALLOW_FILE = path.join(ROOT, 'scripts/modulePlacement.allow.json');
const JSON_OUT = process.argv.includes('--json');
const LIST = process.argv.includes('--list');

// ---------------------------------------------------------------- file system
const walk = (dir, out = []) => {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.ts') || e.name.endsWith('.tsx')) out.push(p);
  }
  return out;
};

const srcFiles = walk(path.join(PKG, 'src'))
  .map((p) => path.relative(PKG, p))
  .sort();
const resolvable = new Set([...srcFiles, 'index.ts']);

// ---------------------------------------------------------------- import parsing
// Matches `import …from '…'` / `export …from '…'` anchored at the start of a line, so a
// `from '` inside a string literal or comment body cannot be mistaken for a statement.
const STATEMENT = /^[ \t]*(import|export)\b([\s\S]*?)\bfrom\s*'([^']+)'/gm;
const SIDE_EFFECT = /^[ \t]*import\s*'([^']+)'/gm;

// Returns {spec, isValue} for every relative import in the file.
const parseImports = (text) => {
  const out = [];
  for (const m of text.matchAll(STATEMENT)) {
    const [, , clauseRaw, spec] = m;
    if (!spec.startsWith('.')) continue;
    const clause = clauseRaw.trim();
    if (/^type\b/.test(clause)) {
      out.push({ spec, isValue: false });
      continue;
    }
    const named = clause.match(/\{([\s\S]*)\}/);
    if (!named) {
      // default import, namespace import, or `export * from`
      out.push({ spec, isValue: true });
      continue;
    }
    const before = clause.slice(0, clause.indexOf('{')).replace(/,/g, '').trim();
    const specifiers = named[1]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const hasValue = before.length > 0 || specifiers.some((s) => !/^type\b/.test(s));
    out.push({ spec, isValue: hasValue });
  }
  for (const m of text.matchAll(SIDE_EFFECT)) {
    if (m[1].startsWith('.')) out.push({ spec: m[1], isValue: true });
  }
  return out;
};

const resolveSpec = (fromRel, spec) => {
  const base = path.normalize(path.join(path.dirname(fromRel), spec));
  for (const c of [base + '.ts', base + '.tsx', base, path.join(base, 'index.ts')]) {
    if (resolvable.has(c)) return c;
  }
  return null;
};

const valueEdges = [];
const barrelEdges = [];
for (const f of srcFiles) {
  const text = fs.readFileSync(path.join(PKG, f), 'utf8');
  for (const { spec, isValue } of parseImports(text)) {
    const to = resolveSpec(f, spec);
    if (!to) continue;
    if (to === 'index.ts') {
      barrelEdges.push({ from: f, spec });
      continue;
    }
    if (isValue) valueEdges.push({ from: f, to });
  }
}

// ---------------------------------------------------------------- folder model
const filesIn = (dir) =>
  srcFiles.filter((f) => path.dirname(f) === dir).map((f) => path.basename(f));
const entryOf = (dir) => {
  const n = path.basename(dir);
  const cap = n.charAt(0).toUpperCase() + n.slice(1);
  const kids = filesIn(dir);
  for (const c of [`${n}.ts`, `create${cap}.ts`, `createSafe${cap}.ts`])
    if (kids.includes(c)) return c;
  return null;
};
const isCommon = (dir) => path.basename(dir) === '_common';
const isModuleFolder = (dir) => dir !== 'src' && !isCommon(dir) && entryOf(dir) !== null;
const isGroupFolder = (dir) => dir !== 'src' && !isCommon(dir) && entryOf(dir) === null;
const isFeatureRoot = (dir) => path.dirname(dir) === 'src' && dir !== 'src';
const inside = (f, d) => (d === 'src' ? f.startsWith('src/') : f === d || f.startsWith(d + '/'));

// The unit that moves: the outermost module folder this file is the entry of.
const unitOf = (f) => {
  let u = f;
  for (;;) {
    const d = path.dirname(u);
    if (isModuleFolder(d) && path.basename(u) === entryOf(d)) u = d;
    else return u;
  }
};

// Shallowest scope from which `m` may be imported.
const chainOwner = (parts, i) => {
  let j = i;
  while (j >= 1 && parts[j - 1] === '_common') j--;
  return parts.slice(0, j).join('/');
};
const barrierFor = (m) => {
  const parts = m.split('/');
  let b = 'src';
  const deeper = (x) => x.split('/').length > b.split('/').length;
  for (let i = parts.length - 1; i >= 1; i--) {
    const dir = parts.slice(0, i).join('/');
    if (isCommon(dir)) {
      const o = chainOwner(parts, i);
      if (deeper(o)) b = o;
    } else if (isModuleFolder(dir) && parts[i] !== entryOf(dir)) {
      if (deeper(dir)) b = dir;
    }
  }
  return b;
};

// A module has a layer only if walking up through GROUP folders reaches a _common.
const layerOf = (f) => {
  let d = path.dirname(f);
  while (isGroupFolder(d)) d = path.dirname(d);
  if (!isCommon(d)) return null;
  const parts = d.split('/');
  let j = parts.length;
  while (j >= 1 && parts[j - 1] === '_common') j--;
  return { owner: parts.slice(0, j).join('/'), layer: parts.length - j };
};

// ---------------------------------------------------------------- checks
const findings = [];
const add = (check, key, subject, message) =>
  findings.push({ check, key: `${check}:${key}`, subject, message });

for (const e of barrelEdges) {
  add(
    'barrel',
    e.from,
    e.from,
    `imports from the package index.ts ('${e.spec}') — import the module directly`,
  );
}

const consumers = new Map(srcFiles.map((f) => [f, new Set()]));
for (const e of valueEdges) if (e.from !== e.to) consumers.get(e.to)?.add(e.from);

for (const e of valueEdges) {
  const b = barrierFor(e.to);
  if (!inside(e.from, b)) {
    add(
      'encapsulation',
      `${e.from}::${e.to}`,
      e.from,
      `reaches into ${e.to}, which is only visible inside ${b}/`,
    );
  }
}

const stripTrailing = (d) => {
  const p = d.split('/');
  while (p.length && p[p.length - 1] === '_common') p.pop();
  return p.join('/');
};
const lcaDir = (files) => {
  const parts = files.map((f) => path.dirname(f).split('/'));
  const out = [];
  for (let i = 0; i < parts[0].length; i++) {
    const s = parts[0][i];
    if (parts.every((p) => p[i] === s)) out.push(s);
    else break;
  }
  return out.join('/');
};
const leadingCommon = (file, X) => {
  const rel = path.relative(X, path.dirname(file)).split('/').filter(Boolean);
  let k = 0;
  while (k < rel.length && rel[k] === '_common') k++;
  return k;
};

for (const m of srcFiles) {
  const unit = unitOf(m);
  if (isFeatureRoot(unit) || unit === 'src') continue; // pinned
  const C = [...consumers.get(m)].filter((c) => !(unit !== m && inside(c, unit))).sort();
  if (C.length === 0) continue;
  const dir = path.dirname(unit);

  if (C.length === 1) {
    const c = C[0];
    const cdir = path.dirname(c);
    const cIsEntry = isModuleFolder(cdir) && path.basename(c) === entryOf(cdir);
    const required = cIsEntry ? cdir : path.join(cdir, path.basename(c, '.ts'));
    if (!inside(unit, required)) {
      add(
        'placement',
        m,
        m,
        `single value consumer ${c} → ${unit === m ? 'move it' : `move ${unit}/`} under ${required}/${cIsEntry ? '' : ' (promote that bare file to a folder)'}`,
      );
    }
    continue;
  }

  const X = stripTrailing(lcaDir(C));
  const k = Math.max(...C.map((c) => leadingCommon(c, X)));
  const expected = X + '/_common'.repeat(k + 1);
  const rel = path.relative(X, dir).split('/').filter(Boolean);
  let aK = 0;
  while (aK < rel.length && rel[aK] === '_common') aK++;
  const actual = [X, ...rel.slice(0, aK)].filter(Boolean).join('/');
  if (path.relative(X, dir).startsWith('..') || actual !== expected) {
    add(
      'placement',
      m,
      m,
      `${C.length} value consumers → expected ${expected}/, sits at ${actual || dir}/`,
    );
  }
}

for (const e of valueEdges) {
  const a = layerOf(e.from);
  const b = layerOf(e.to);
  if (!a || !b || a.owner !== b.owner) continue;
  if (b.layer <= a.layer) {
    add(
      'layering',
      `${e.from}::${e.to}`,
      e.from,
      `imports ${e.to} — layer ${a.layer} → layer ${b.layer} of the same owner (${a.owner}/); the ladder must be strict`,
    );
  }
}

// ---------------------------------------------------------------- allowlist
const allow = fs.existsSync(ALLOW_FILE) ? JSON.parse(fs.readFileSync(ALLOW_FILE, 'utf8')) : {};
const found = new Set(findings.map((f) => f.key));
const stale = Object.keys(allow).filter((k) => !found.has(k));
const active = findings.filter((f) => !(f.key in allow));

if (JSON_OUT) {
  console.log(
    JSON.stringify(
      {
        findings,
        allowed: Object.keys(allow),
        stale,
        modules: srcFiles.length,
        valueEdges: valueEdges.length,
      },
      null,
      2,
    ),
  );
  process.exit(active.length || stale.length ? 1 : 0);
}

const byCheck = (list) => {
  const g = {};
  for (const f of list) (g[f.check] ??= []).push(f);
  return g;
};

console.log(
  `module-placement: ${srcFiles.length} modules, ${valueEdges.length} src→src value edges`,
);

if (LIST) {
  for (const [check, list] of Object.entries(byCheck(findings))) {
    console.log(`\n${check} (${list.length})`);
    for (const f of list) console.log(`  ${f.key in allow ? '[allowed] ' : ''}${f.message}`);
  }
}

if (active.length) {
  console.log(`\n${active.length} finding(s):`);
  for (const [check, list] of Object.entries(byCheck(active))) {
    console.log(`\n  ${check}`);
    for (const f of list) console.log(`    ${f.subject}\n      ${f.message}`);
  }
  console.log(`\nFix them, or record them in ${path.relative(ROOT, ALLOW_FILE)} with a reason.`);
}

if (stale.length) {
  console.log(
    `\n${stale.length} stale allowlist entr(ies) — the finding is gone, delete the entry:`,
  );
  for (const k of stale) console.log(`    ${k}`);
}

if (!active.length && !stale.length) {
  console.log(`conforms (${Object.keys(allow).length} known deviation(s) allowlisted)`);
}

process.exit(active.length || stale.length ? 1 : 0);
