# Seeded Chart of Accounts — Hierarchical Mindmap

**System:** Red Sea DMS | **Source:** `src/database/seeders/account/data.ts`

---

## How to paste into Mermaid Live

**Do not paste this whole markdown file into Mermaid Live.**

Open **`docs/mermaid/chart-of-accounts.mmd`** instead:

1. Go to [https://mermaid.live](https://mermaid.live)
2. Open `docs/mermaid/chart-of-accounts.mmd`
3. **Ctrl+A** → **Ctrl+C** → paste into Mermaid Live
4. Export PNG / SVG / PDF

The first diagram line must be `flowchart TB` (comments starting with `%%` at the top are ignored by Mermaid Live).

---

## Legend

- **Branch** = grouping account (no direct postings)
- **Leaf** = posting account (journal entries go here)
- **DEBIT / CREDIT** = normal balance
- All seeded accounts are system accounts (`isSystem=true`, read-only via API)

**Totals:** 59 accounts · 42 leaf (posting) accounts

---

## Full chart (copy this block)

File: `docs/mermaid/chart-of-accounts.mmd`

```
%% Seeded Chart of Accounts — Red Sea DMS
%% Source: src/database/seeders/account/data.ts
%% Paste entire file into https://mermaid.live (Ctrl+A in this file, then paste)
%% Branch = grouping account | Leaf = posting account
flowchart TB
  a1["الأصول | ASSET DEBIT | Branch"]
  a6["الاصول الغير متداوله ( اصول ثابته ) | ASSET DEBIT | Branch"]
  a7["اصول ملموسه | ASSET DEBIT | Branch"]
  a8["تاسيس وتجهيز | ASSET DEBIT | Leaf"]
  a9["الات ومعدات | ASSET DEBIT | Leaf"]
  a10["سيارات | ASSET DEBIT | Leaf"]
  a11["اجهزه كهربائيه | ASSET DEBIT | Leaf"]
  a12["اثاث | ASSET DEBIT | Leaf"]
  a13["اجهزه كمبيوتر | ASSET DEBIT | Leaf"]
  a14["استثمارات طويله الاجل | ASSET DEBIT | Leaf"]
  a15["اصول غير ملموسه | ASSET DEBIT | Branch"]
  a16["الشهره والسمه التجاريه | ASSET DEBIT | Leaf"]
  a17["الاصول المتداوله | ASSET DEBIT | Branch"]
  a18["الخزينه | CASH DEBIT | Leaf"]
  a19["البنك | CASH DEBIT | Leaf"]
  a20["المخزون | ASSET DEBIT | Leaf"]
  a21["عملاء | ASSET DEBIT | Leaf"]
  a22["ا.قبض | ASSET DEBIT | Leaf"]
  a23["مدينين وارصده مدينه اخرى | ASSET DEBIT | Branch"]
  a24["عهد | ASSET DEBIT | Leaf"]
  a25["سلف | ASSET DEBIT | Leaf"]
  a26["ضرائب منبع | ASSET DEBIT | Leaf"]
  a27["تامينات لدى الغير | ASSET DEBIT | Leaf"]
  a28["موردين د.مقدمه | ASSET DEBIT | Leaf"]
  a2["الخصوم | LIABILITY CREDIT | Branch"]
  a29["الالتزامات الغير متداوله | LIABILITY CREDIT | Branch"]
  a30["قروض | LIABILITY CREDIT | Leaf"]
  a31["التزامات ضريبيه مؤجله | LIABILITY CREDIT | Leaf"]
  a32["الالتزامات المتداوله | LIABILITY CREDIT | Branch"]
  a33["موردين | LIABILITY CREDIT | Leaf"]
  a34["ا.دفع | LIABILITY CREDIT | Leaf"]
  a35["دائنين وارصده دائنه اخرى | LIABILITY CREDIT | Branch"]
  a36["ضريبه مرتبات | LIABILITY CREDIT | Leaf"]
  a37["ضريبه الخصم والاضافه | LIABILITY CREDIT | Leaf"]
  a38["المساهمه التكافليه | LIABILITY CREDIT | Leaf"]
  a39["ضريبه الدخل | LIABILITY CREDIT | Leaf"]
  a40["تامينات للغير | LIABILITY CREDIT | Leaf"]
  a3["حقوق الملكية | EQUITY CREDIT | Branch"]
  a41["راس المال وحقوق الملكيه | EQUITY CREDIT | Branch"]
  a42["راس المال | EQUITY CREDIT | Leaf"]
  a43["جارى الشركاء | EQUITY CREDIT | Leaf"]
  a44["ارباح / خسائر مرحله | EQUITY CREDIT | Leaf"]
  a45["ارباح / خسائر العام | EQUITY CREDIT | Leaf"]
  a46["مجمع الاهلاك | EQUITY CREDIT | Leaf"]
  a47["احتياطيات | EQUITY CREDIT | Leaf"]
  a4["الإيرادات | REVENUE CREDIT | Branch"]
  a48["الايرادات | REVENUE CREDIT | Leaf"]
  a49["مردودات الايرادات | REVENUE DEBIT | Leaf"]
  a5["المصروفات | EXPENSE DEBIT | Branch"]
  a50["تكلفة المبيعات | EXPENSE DEBIT | Branch"]
  a53["مشتريات | EXPENSE DEBIT | Leaf"]
  a54["مردودات مشتريات | EXPENSE CREDIT | Leaf"]
  a51["المصروفات التشغيلية | EXPENSE DEBIT | Branch"]
  a55["م.التشغيل | EXPENSE DEBIT | Leaf"]
  a56["م.عموميه | EXPENSE DEBIT | Leaf"]
  a57["م.اهلاك | EXPENSE DEBIT | Leaf"]
  a52["المصروفات التمويلية والضريبية | EXPENSE DEBIT | Branch"]
  a58["م.تمويليه | EXPENSE DEBIT | Leaf"]
  a59["م.ضريبه الدخل | EXPENSE DEBIT | Leaf"]
  a1 --> a6
  a6 --> a7
  a7 --> a8
  a7 --> a9
  a7 --> a10
  a7 --> a11
  a7 --> a12
  a7 --> a13
  a6 --> a14
  a6 --> a15
  a15 --> a16
  a1 --> a17
  a17 --> a18
  a17 --> a19
  a17 --> a20
  a17 --> a21
  a17 --> a22
  a17 --> a23
  a23 --> a24
  a23 --> a25
  a23 --> a26
  a23 --> a27
  a23 --> a28
  a2 --> a29
  a29 --> a30
  a29 --> a31
  a2 --> a32
  a32 --> a33
  a32 --> a34
  a32 --> a35
  a35 --> a36
  a35 --> a37
  a35 --> a38
  a35 --> a39
  a35 --> a40
  a3 --> a41
  a41 --> a42
  a41 --> a43
  a41 --> a44
  a41 --> a45
  a41 --> a46
  a41 --> a47
  a4 --> a48
  a4 --> a49
  a5 --> a50
  a50 --> a53
  a50 --> a54
  a5 --> a51
  a51 --> a55
  a51 --> a56
  a51 --> a57
  a5 --> a52
  a52 --> a58
  a52 --> a59
```

---

## Text hierarchy (for Word / email — not for Mermaid)

```
CHART OF ACCOUNTS
├── الأصول — ASSET | DEBIT
│   ├── الاصول الغير متداوله ( اصول ثابته )
│   └── الاصول المتداوله
├── الخصوم — LIABILITY | CREDIT
├── حقوق الملكية — EQUITY | CREDIT
├── الإيرادات — REVENUE | CREDIT
└── المصروفات — EXPENSE | DEBIT
```

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

```bash
node scripts/generate-coa-mermaid.js && node scripts/generate-coa-markdown.js
```
