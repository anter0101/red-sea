const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../../docs/accounting');
const mermaidFile = path.join(docsDir, 'mermaid/chart-of-accounts.mmd');
const content = fs.readFileSync(mermaidFile, 'utf8').trimEnd();

const md = `# Seeded Chart of Accounts — Hierarchical Mindmap

**System:** Red Sea DMS | **Source:** \`src/database/seeders/account/data.ts\`

---

## How to paste into Mermaid Live

**Do not paste this whole markdown file into Mermaid Live.**

Open **\`mermaid/chart-of-accounts.mmd\`** instead:

1. Go to [https://mermaid.live](https://mermaid.live)
2. Open \`mermaid/chart-of-accounts.mmd\`
3. **Ctrl+A** → **Ctrl+C** → paste into Mermaid Live
4. Export PNG / SVG / PDF

The first diagram line must be \`flowchart TB\` (comments starting with \`%%\` at the top are ignored by Mermaid Live).

---

## Legend

- **Branch** = grouping account (no direct postings)
- **Leaf** = posting account (journal entries go here)
- **DEBIT / CREDIT** = normal balance
- All seeded accounts are system accounts (\`isSystem=true\`, read-only via API)

**Totals:** 65 accounts · 44 leaf (posting) accounts

---

## Full chart (copy this block)

File: \`mermaid/chart-of-accounts.mmd\`

\`\`\`
${content}
\`\`\`

---

## Text hierarchy (for Word / email — not for Mermaid)

\`\`\`
CHART OF ACCOUNTS
├── الأصول — ASSET | DEBIT
│   ├── الاصول الغير متداوله ( اصول ثابته )
│   └── الاصول المتداوله
├── الخصوم — LIABILITY | CREDIT
├── حقوق الملكية — EQUITY | CREDIT
├── الإيرادات — REVENUE | CREDIT
└── المصروفات — EXPENSE | DEBIT
\`\`\`

---

## Review questions for accountant

1. Is the 5-root hierarchy correct for Egyptian transport/logistics?
2. Is **مجمع الاهلاك** correctly under equity vs contra-asset?
3. Are contra accounts (مردودات الايرادات, مردودات مشتريات) correct?
4. Is **عهد** (custody) correctly placed for driver advances?
5. Any missing accounts (freight revenue, fuel, maintenance)?
6. Which leaf accounts need opening balances at migration?

---

## Regenerate

\`\`\`bash
node scripts/generate-coa-mermaid.js && node scripts/generate-coa-markdown.js
\`\`\`
`;

fs.writeFileSync(path.join(docsDir, 'SEEDED_CHART_OF_ACCOUNTS_MINDMAP.md'), md, 'utf8');
console.log('Updated SEEDED_CHART_OF_ACCOUNTS_MINDMAP.md');
