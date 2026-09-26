// Generates a Mermaid classDiagram for TypeORM-like entities under src/app/modules
// Usage: node scripts/generate-entity-mermaid.cjs

const fs = require('fs');
const path = require('path');

let ts;
try {
  ts = require('typescript');
} catch (e) {
  console.error('Missing dependency: typescript. Install deps first (pnpm install).');
  process.exit(1);
}

const WORKSPACE_ROOT = path.resolve(__dirname, '..');
const MODULES_ROOT = path.join(WORKSPACE_ROOT, 'src', 'app', 'modules');

const AUDIT_FIELD_NAMES = new Set([
  'createdAt',
  'updatedAt',
  'deletedAt',
  'createdBy',
  'updatedBy',
  'deletedBy',
  'created_at',
  'updated_at',
  'deleted_at',
  'created_by',
  'updated_by',
  'deleted_by',
]);

const ENTITY_DECORATORS = new Set(['Entity', 'ChildEntity', 'ViewEntity']);

function walkDir(dir) {
  const out = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walkDir(p));
    else out.push(p);
  }
  return out;
}

function getDecoratorName(decorator) {
  const expr = decorator.expression;
  if (ts.isCallExpression(expr)) {
    const callee = expr.expression;
    if (ts.isIdentifier(callee)) return callee.text;
    if (ts.isPropertyAccessExpression(callee)) return callee.name.text;
  }
  if (ts.isIdentifier(expr)) return expr.text;
  return undefined;
}

function getDecoratorCall(decorator) {
  const expr = decorator.expression;
  return ts.isCallExpression(expr) ? expr : undefined;
}

function isEntityClass(node) {
  if (!ts.isClassDeclaration(node) || !node.name) return false;
  const decorators = ts.canHaveDecorators(node) ? ts.getDecorators(node) : undefined;
  if (!decorators) return false;
  return decorators.some((d) => ENTITY_DECORATORS.has(getDecoratorName(d) || ''));
}

function isPlainClass(node) {
  return ts.isClassDeclaration(node) && !!node.name;
}

function getHeritageExtendsName(cls) {
  if (!cls.heritageClauses) return undefined;
  for (const h of cls.heritageClauses) {
    if (h.token !== ts.SyntaxKind.ExtendsKeyword) continue;
    const t = h.types?.[0];
    if (!t) continue;
    const expr = t.expression;
    if (ts.isIdentifier(expr)) return expr.text;
    if (ts.isPropertyAccessExpression(expr)) return expr.name.text;
  }
  return undefined;
}

function unwrapTypeText(typeNode) {
  if (!typeNode) return 'any';
  if (ts.isArrayTypeNode(typeNode)) return `${unwrapTypeText(typeNode.elementType)}[]`;
  if (ts.isTypeReferenceNode(typeNode)) {
    const tn = typeNode.typeName;
    if (ts.isIdentifier(tn)) return tn.text;
    if (ts.isQualifiedName(tn)) return tn.right.text;
  }
  switch (typeNode.kind) {
    case ts.SyntaxKind.StringKeyword:
      return 'string';
    case ts.SyntaxKind.NumberKeyword:
      return 'number';
    case ts.SyntaxKind.BooleanKeyword:
      return 'boolean';
    case ts.SyntaxKind.DateKeyword:
      return 'Date';
    case ts.SyntaxKind.AnyKeyword:
      return 'any';
    case ts.SyntaxKind.UnknownKeyword:
      return 'unknown';
    case ts.SyntaxKind.BigIntKeyword:
      return 'bigint';
    case ts.SyntaxKind.ObjectKeyword:
      return 'object';
    case ts.SyntaxKind.VoidKeyword:
      return 'void';
    case ts.SyntaxKind.NullKeyword:
      return 'null';
    case ts.SyntaxKind.UndefinedKeyword:
      return 'undefined';
    default:
      break;
  }

  try {
    return typeNode.getText();
  } catch {
    return 'any';
  }
}

function getRelationTargetFromArg(arg) {
  // Expected: () => TargetEntity OR () => TargetEntity[]
  if (!arg) return undefined;
  if (ts.isArrowFunction(arg) || ts.isFunctionExpression(arg)) {
    const body = arg.body;
    if (ts.isIdentifier(body)) return body.text;
    if (ts.isPropertyAccessExpression(body)) return body.name.text;
    if (ts.isParenthesizedExpression(body)) {
      const e = body.expression;
      if (ts.isIdentifier(e)) return e.text;
      if (ts.isPropertyAccessExpression(e)) return e.name.text;
    }
    if (ts.isBlock(body)) {
      for (const st of body.statements) {
        if (ts.isReturnStatement(st) && st.expression) {
          const e = st.expression;
          if (ts.isIdentifier(e)) return e.text;
          if (ts.isPropertyAccessExpression(e)) return e.name.text;
        }
      }
    }
  }
  return undefined;
}

function parseObjectLiteralToMap(node) {
  const map = new Map();
  if (!node || !ts.isObjectLiteralExpression(node)) return map;
  for (const prop of node.properties) {
    if (!ts.isPropertyAssignment(prop)) continue;
    const key = ts.isIdentifier(prop.name)
      ? prop.name.text
      : ts.isStringLiteral(prop.name)
        ? prop.name.text
        : undefined;
    if (!key) continue;
    map.set(key, prop.initializer);
  }
  return map;
}

function getStringLiteralValue(node) {
  if (!node) return undefined;
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  return undefined;
}

function inferColumnTypeFromDecoratorArgs(callExpr) {
  // @Column('int') OR @Column({ type: 'int' }) OR @Column({ enum: X })
  const args = callExpr?.arguments || [];
  if (args.length === 0) return undefined;
  const a0 = args[0];
  const s0 = getStringLiteralValue(a0);
  if (s0) return s0;
  const m0 = parseObjectLiteralToMap(a0);
  const typeNode = m0.get('type');
  const typeStr = getStringLiteralValue(typeNode);
  if (typeStr) return typeStr;
  if (m0.has('enum')) return 'enum';
  return undefined;
}

function findDecorator(member, name) {
  const decorators = ts.canHaveDecorators(member) ? ts.getDecorators(member) : undefined;
  if (!decorators) return undefined;
  return decorators.find((d) => getDecoratorName(d) === name);
}

function collectEntities(entityFiles) {
  const entityFileSet = new Set(entityFiles.map((p) => path.normalize(p).toLowerCase()));

  // Add core base entity to improve PK/audit inference when entities extend it.
  const baseEntityPath = path.join(WORKSPACE_ROOT, 'src', 'core', 'utils', 'base.entity.ts');
  const extraFiles = fs.existsSync(baseEntityPath) ? [baseEntityPath] : [];
  for (const f of extraFiles) {
    entityFileSet.add(path.normalize(f).toLowerCase());
  }

  const rootNames = [...new Set([...entityFiles, ...extraFiles])];

  const program = ts.createProgram({
    rootNames,
    options: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      experimentalDecorators: true,
      emitDecoratorMetadata: false,
      skipLibCheck: true,
      strict: false,
    },
  });

  const entities = new Map(); // name -> { name, file, base, fields: [], relations: [] }
  const neededBaseNames = new Set();

  for (const sf of program.getSourceFiles()) {
    if (!entityFileSet.has(path.normalize(sf.fileName).toLowerCase())) continue;

    ts.forEachChild(sf, (node) => {
      if (!isEntityClass(node)) return;
      const name = node.name.text;
      const base = getHeritageExtendsName(node);
      if (base) neededBaseNames.add(base);

      const fields = [];
      const relations = [];

      for (const member of node.members) {
        if (!ts.isPropertyDeclaration(member) || !member.name) continue;
        const propName = ts.isIdentifier(member.name)
          ? member.name.text
          : ts.isStringLiteral(member.name)
            ? member.name.text
            : undefined;
        if (!propName) continue;
        if (AUDIT_FIELD_NAMES.has(propName)) continue;

        const decorators = ts.canHaveDecorators(member) ? ts.getDecorators(member) : undefined;
        const decNames = new Set(
          (decorators || []).map((d) => getDecoratorName(d)).filter(Boolean),
        );

        const isPrimary =
          decNames.has('PrimaryGeneratedColumn') ||
          decNames.has('PrimaryColumn') ||
          decNames.has('PrimaryGeneratedColumnUUID') ||
          decNames.has('PrimaryGeneratedColumn') ||
          decNames.has('ObjectIdColumn');

        const isColumn =
          isPrimary ||
          decNames.has('Column') ||
          decNames.has('CreateDateColumn') ||
          decNames.has('UpdateDateColumn') ||
          decNames.has('DeleteDateColumn');

        const relDecoratorName = ['OneToOne', 'OneToMany', 'ManyToOne', 'ManyToMany'].find((n) =>
          decNames.has(n),
        );

        if (relDecoratorName) {
          const relDec = findDecorator(member, relDecoratorName);
          const relCall = relDec ? getDecoratorCall(relDec) : undefined;
          const target = relCall ? getRelationTargetFromArg(relCall.arguments[0]) : undefined;

          const joinTableDec = findDecorator(member, 'JoinTable');
          const joinColDec = findDecorator(member, 'JoinColumn');

          let joinTableName;
          if (joinTableDec) {
            const call = getDecoratorCall(joinTableDec);
            const opts = call?.arguments?.[0];
            const m = parseObjectLiteralToMap(opts);
            joinTableName = getStringLiteralValue(m.get('name'));
          }

          let joinColumnName;
          if (joinColDec) {
            const call = getDecoratorCall(joinColDec);
            const opts = call?.arguments?.[0];
            const m = parseObjectLiteralToMap(opts);
            joinColumnName = getStringLiteralValue(m.get('name'));
          }

          const typeText = unwrapTypeText(member.type);
          const isArray = typeText.endsWith('[]');

          relations.push({
            prop: propName,
            kind: relDecoratorName,
            target,
            isArray,
            joinTableName,
            joinColumnName,
            file: sf.fileName,
          });
          continue;
        }

        if (isColumn) {
          // ignore audit column decorators unless field name is not a standard audit field (already filtered above)
          if (
            decNames.has('CreateDateColumn') ||
            decNames.has('UpdateDateColumn') ||
            decNames.has('DeleteDateColumn')
          ) {
            // Non-standard name; keep it.
          }

          let colType;
          const primaryGen = findDecorator(member, 'PrimaryGeneratedColumn');
          const primaryCol = findDecorator(member, 'PrimaryColumn');
          const colDec = findDecorator(member, 'Column');

          const primaryCall = primaryGen
            ? getDecoratorCall(primaryGen)
            : primaryCol
              ? getDecoratorCall(primaryCol)
              : undefined;
          const colCall = colDec ? getDecoratorCall(colDec) : undefined;

          colType =
            inferColumnTypeFromDecoratorArgs(primaryCall) ||
            inferColumnTypeFromDecoratorArgs(colCall);

          const tsType = unwrapTypeText(member.type);
          const type = colType || tsType || 'any';

          fields.push({
            name: propName,
            type,
            isPrimary,
          });
        }
      }

      entities.set(name, {
        name,
        file: sf.fileName,
        base,
        fields,
        relations,
      });
    });
  }

  // Second pass: include abstract/base classes referenced via extends, even if not decorated with @Entity.
  if (neededBaseNames.size > 0) {
    for (const sf of program.getSourceFiles()) {
      if (!entityFileSet.has(path.normalize(sf.fileName).toLowerCase())) continue;

      ts.forEachChild(sf, (node) => {
        if (!isPlainClass(node) || !node.name) return;
        const name = node.name.text;
        if (!neededBaseNames.has(name)) return;
        if (entities.has(name)) return;

        const base = getHeritageExtendsName(node);
        if (base) neededBaseNames.add(base);

        const fields = [];
        const relations = [];

        for (const member of node.members) {
          if (!ts.isPropertyDeclaration(member) || !member.name) continue;
          const propName = ts.isIdentifier(member.name)
            ? member.name.text
            : ts.isStringLiteral(member.name)
              ? member.name.text
              : undefined;
          if (!propName) continue;
          if (AUDIT_FIELD_NAMES.has(propName)) continue;

          const decorators = ts.canHaveDecorators(member) ? ts.getDecorators(member) : undefined;
          const decNames = new Set(
            (decorators || []).map((d) => getDecoratorName(d)).filter(Boolean),
          );

          const isPrimary =
            decNames.has('PrimaryGeneratedColumn') ||
            decNames.has('PrimaryColumn') ||
            decNames.has('PrimaryGeneratedColumnUUID') ||
            decNames.has('PrimaryGeneratedColumn') ||
            decNames.has('ObjectIdColumn');

          const isColumn =
            isPrimary ||
            decNames.has('Column') ||
            decNames.has('CreateDateColumn') ||
            decNames.has('UpdateDateColumn') ||
            decNames.has('DeleteDateColumn');

          if (!isColumn) continue;

          let colType;
          const primaryGen = findDecorator(member, 'PrimaryGeneratedColumn');
          const primaryCol = findDecorator(member, 'PrimaryColumn');
          const colDec = findDecorator(member, 'Column');

          const primaryCall = primaryGen
            ? getDecoratorCall(primaryGen)
            : primaryCol
              ? getDecoratorCall(primaryCol)
              : undefined;
          const colCall = colDec ? getDecoratorCall(colDec) : undefined;

          colType =
            inferColumnTypeFromDecoratorArgs(primaryCall) ||
            inferColumnTypeFromDecoratorArgs(colCall);

          const tsType = unwrapTypeText(member.type);
          const type = colType || tsType || 'any';

          fields.push({
            name: propName,
            type,
            isPrimary,
          });
        }

        entities.set(name, {
          name,
          file: sf.fileName,
          base,
          fields,
          relations,
        });
      });
    }
  }

  return entities;
}

function normalizeEntityName(name) {
  if (!name) return undefined;
  // Prefer stripping trailing Entity if used.
  if (name === 'BaseEntity') return 'BaseEntity';
  return name.endsWith('Entity') ? name.slice(0, -6) : name;
}

function buildMermaid(entities) {
  // Map original class name -> display name
  const nameMap = new Map();
  for (const [k, v] of entities) {
    nameMap.set(k, normalizeEntityName(v.name));
  }

  const classes = [];
  const inherits = [];
  const edges = new Map(); // key -> line

  // Precompute owning-side pairs to avoid drawing inverse duplicates.
  const manyToOnePairs = new Set(); // `${from}::${to}` in display names
  const manyToManyOwningPairs = new Set();
  for (const ent of entities.values()) {
    const from = nameMap.get(ent.name) || ent.name;
    for (const rel of ent.relations) {
      if (!rel.target) continue;
      const to = nameMap.get(rel.target) || normalizeEntityName(rel.target) || rel.target;
      if (!to) continue;
      if (rel.kind === 'ManyToOne') manyToOnePairs.add(`${from}::${to}`);
      if (rel.kind === 'ManyToMany' && rel.joinTableName) {
        manyToManyOwningPairs.add(`${from}::${to}`);
      }
    }
  }

  // Build class blocks
  for (const ent of entities.values()) {
    const display = nameMap.get(ent.name) || ent.name;

    const lines = [];
    // Sort: primary keys first
    const sortedFields = [...ent.fields].sort(
      (a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0),
    );
    for (const f of sortedFields) {
      if (AUDIT_FIELD_NAMES.has(f.name)) continue;
      const prefix = f.isPrimary ? '+(PK) ' : '+';
      lines.push(`  ${prefix}${f.name}: ${f.type}`);
    }

    classes.push(`class ${display} {\n${lines.join('\n')}\n}`);

    if (ent.base) {
      const baseDisplay = normalizeEntityName(ent.base);
      inherits.push(`${baseDisplay} <|-- ${display}`);
    }
  }

  function addEdge(from, fromCard, to, toCard, label) {
    const key = `${from}|${fromCard}|${to}|${toCard}|${label || ''}`;
    if (edges.has(key)) return;
    const relLabel = label ? ` : ${label}` : '';
    edges.set(key, `${from} "${fromCard}" --> "${toCard}" ${to}${relLabel}`);
  }

  // Build edges
  // Strategy: prefer owning sides
  for (const ent of entities.values()) {
    const from = nameMap.get(ent.name) || ent.name;

    for (const rel of ent.relations) {
      const targetRaw = rel.target;
      if (!targetRaw) continue;
      const toName = nameMap.get(targetRaw) || normalizeEntityName(targetRaw) || targetRaw;

      if (!toName) continue;

      if (rel.kind === 'ManyToOne') {
        const lbl = rel.joinColumnName ? `${rel.prop} (fk: ${rel.joinColumnName})` : rel.prop;
        addEdge(from, '*', toName, '1', lbl);
      } else if (rel.kind === 'OneToOne') {
        // owning side if JoinColumn exists, otherwise still include
        const lbl = rel.joinColumnName ? `${rel.prop} (fk: ${rel.joinColumnName})` : rel.prop;
        addEdge(from, '1', toName, '1', lbl);
      } else if (rel.kind === 'ManyToMany') {
        // Prefer owning side that has @JoinTable (join table is defined there)
        if (manyToManyOwningPairs.size > 0 && !rel.joinTableName) continue;
        const lbl = rel.joinTableName ? `${rel.prop} (join: ${rel.joinTableName})` : rel.prop;
        addEdge(from, '*', toName, '*', lbl);
      } else if (rel.kind === 'OneToMany') {
        // Inverse side; omit if corresponding ManyToOne exists (child -> parent)
        if (manyToOnePairs.has(`${toName}::${from}`)) continue;
        addEdge(from, '1', toName, '*', rel.prop);
      }
    }
  }

  // Ensure base classes exist if referenced by inheritance
  const allClassNames = new Set(classes.map((c) => c.match(/^class\s+(\w+)/)?.[1]).filter(Boolean));
  for (const inh of inherits) {
    const m = inh.match(/^(\w+)\s+<\|--\s+(\w+)$/);
    if (!m) continue;
    const base = m[1];
    if (!allClassNames.has(base)) {
      classes.unshift(`class ${base} {\n}`);
      allClassNames.add(base);
    }
  }

  const out = [];
  out.push('classDiagram');
  // Put classes first
  out.push(...classes);
  // Inheritance
  out.push(...inherits);
  // Relations
  out.push(...Array.from(edges.values()));

  return out.join('\n');
}

function main() {
  if (!fs.existsSync(MODULES_ROOT)) {
    console.error('Modules root not found:', MODULES_ROOT);
    process.exit(1);
  }

  const outArgIndex = process.argv.indexOf('--out');
  const outPath =
    outArgIndex >= 0 && process.argv[outArgIndex + 1]
      ? path.resolve(WORKSPACE_ROOT, process.argv[outArgIndex + 1])
      : path.join(WORKSPACE_ROOT, 'entity-diagram.txt');

  const allFiles = walkDir(MODULES_ROOT);
  const entityFiles = allFiles.filter((f) => f.endsWith('.entity.ts'));

  const entities = collectEntities(entityFiles);
  const mermaid = buildMermaid(entities);

  // Write to txt for easy copy/paste, and also print to stdout.
  fs.writeFileSync(outPath, mermaid, 'utf8');
  process.stdout.write(mermaid);
}

main();
