const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(
  path.join(__dirname, '../src/database/seeders/account/data.ts'),
  'utf8',
);

const accounts = [];
const re =
  /\{\s*name:\s*'([^']+)',\s*type:\s*AccountType\.(\w+),\s*normalBalance:\s*normalBalanceType\.(\w+),\s*isLeaf:\s*(true|false)(?:,\s*parentName:\s*'([^']*)')?/g;
let m;
while ((m = re.exec(src)) !== null) {
  accounts.push({
    name: m[1],
    type: m[2],
    nb: m[3],
    isLeaf: m[4] === 'true',
    parent: m[5],
  });
}

const children = new Map();
for (const a of accounts) {
  const p = a.parent || '__ROOT__';
  if (!children.has(p)) children.set(p, []);
  children.get(p).push(a);
}

let counter = 0;
const idByName = new Map();
for (const a of accounts) {
  counter += 1;
  idByName.set(a.name, `a${counter}`);
}

function escapeLabel(text) {
  return text.replace(/"/g, "'").replace(/\n/g, ' ');
}

function nodeLabel(a) {
  const role = a.isLeaf ? 'Leaf' : 'Branch';
  return escapeLabel(`${a.name} | ${a.type} ${a.nb} | ${role}`);
}

function buildFlowchart() {
  const nodeDecls = [];
  const edges = [];

  function walk(name, parentId) {
    const a = accounts.find((x) => x.name === name);
    const id = idByName.get(name);
    nodeDecls.push(`  ${id}["${nodeLabel(a)}"]`);
    if (parentId) {
      edges.push(`  ${parentId} --> ${id}`);
    }
    for (const child of children.get(name) || []) {
      walk(child.name, id);
    }
  }

  for (const root of children.get('__ROOT__') || []) {
    walk(root.name, null);
  }

  const header = [
    '%% Seeded Chart of Accounts — Red Sea DMS',
    '%% Source: src/database/seeders/account/data.ts',
    '%% Paste entire file into https://mermaid.live (Ctrl+A in this file, then paste)',
    '%% Branch = grouping account | Leaf = posting account',
    '',
  ].join('\n');

  return `${header}flowchart TB\n${nodeDecls.join('\n')}\n${edges.join('\n')}\n`;
}

const outDir = path.join(__dirname, '../../docs/accounting/mermaid');
const outFile = path.join(outDir, 'chart-of-accounts.mmd');

fs.mkdirSync(outDir, { recursive: true });

// Remove legacy split files if present
for (const legacy of fs.readdirSync(outDir)) {
  if (legacy.endsWith('.mmd') && legacy !== 'chart-of-accounts.mmd') {
    fs.unlinkSync(path.join(outDir, legacy));
  }
}

fs.writeFileSync(outFile, buildFlowchart());
console.log(`Generated ${outFile} (${accounts.length} accounts)`);
