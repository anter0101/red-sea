#!/usr/bin/env node
// Full system cycle against a running API. Runs one trip cycle per vehicle mode and checks the
// ledger after every step:
//   company car:  ask custody → trip (custody to the driver) → policy with expenses (TRN1 + TRN3)
//                 → invoice → end shift
//   nolon car:    ask custody → trip (custody to the transport supplier) → policy (TRN1 + TRN2)
//                 → invoice → end shift
//   contract car: same as nolon, with a CONTRACT_CAR car and trailer
//
// After each step the trial balance must stay balanced and every account must move by exactly the
// expected amount (any other movement fails). Re-saving a policy must post nothing, and changing a
// posted expense must return 400.
//
// With SETUP=1 it first creates whatever is missing, so it runs on a freshly seeded database
// (admin + chart of accounts only): branch, government, area, client, delivery price, the
// DATA_ENTRY employee (EMP_EMAIL/EMP_PASSWORD), driver, an AVAILABLE car and trailer per mode,
// a transport supplier in the employee's branch, and a treasury opening balance.
//
// It creates REAL data (master data, requests, trips, policies, ledger entries, invoices).
//
// Usage (PowerShell):
//   $env:BASE_URL='http://13.140.130.87'; $env:SETUP='1'
//   $env:EMP_EMAIL='...'; $env:EMP_PASSWORD='...'; $env:ADMIN_EMAIL='...'; $env:ADMIN_PASSWORD='...'
//   node backend/scripts/full-cycle.mjs
//
// Optional: ONLY=company,nolon,contract (any subset), CLIENT_ID, AREA_ID, DRIVER_ID, SUPPLIER_ID,
//           DRY_RUN=1 (read-only checks, creates nothing; SETUP is ignored).

const env = process.env;
const BASE = (env.BASE_URL ?? '').replace(/\/$/, '');
for (const key of ['BASE_URL', 'EMP_EMAIL', 'EMP_PASSWORD', 'ADMIN_EMAIL', 'ADMIN_PASSWORD']) {
  if (!env[key]) {
    console.error(`Missing env ${key}`);
    process.exit(1);
  }
}
const SETUP = Boolean(env.SETUP) && !env.DRY_RUN;
const MODES = (env.ONLY ?? 'company,nolon,contract').split(',').map((m) => m.trim());

const BOOK_WEIGHT = 10;
const ASKED_CUSTODY = 600;
const TRIP_CUSTODY = 500;
const VAT = 14;
const WITHHOLDING = 1;
const TREASURY_OPENING = 100_000;
const EXPENSES = { dieselFees: 300, fuelLiters: 25, cardFees: 50, cardName: 'TEST', scaleFees: 30, tipsFees: 20 };
const SETUP_PRICE = { basePrice: 197, nolonPrice: 120 };

const TREASURY = 'الاصول المتداوله → الخزينه';
const CUSTODY_PARENT = 'عهد';
const TRANSPORT_SUPPLIER_PARENT = 'مورد النقل';
const NOLON_ACCOUNT = 'المصروفات التشغيلية → سيارات عقود النولون';
const EXPENSE_LEAVES = {
  'Diesel Fees': ['المصروفات التشغيلية → سولار', EXPENSES.dieselFees],
  'Card Fees': ['المصروفات التشغيلية → كارته', EXPENSES.cardFees],
  'Weighing Fees': ['المصروفات التشغيلية → ميزان', EXPENSES.scaleFees],
  'Tips Fees': ['المصروفات التشغيلية → اكراميات', EXPENSES.tipsFees],
};
const REMOVED_ACCOUNTS = ['مورد العهدة'];

const VEHICLE_MODES = {
  company: { ownerShip: 'COMPANY_CAR', letters: 'ش ر ك' },
  nolon: { ownerShip: 'NOLON_CAR', letters: 'ن و ل' },
  contract: { ownerShip: 'CONTRACT_CAR', letters: 'ع ق د' },
};

const num = (v) => (v == null || v === '' ? undefined : Number(v));
const money = (v) => Math.round(Number(v ?? 0) * 100) / 100;
const rows = (body) => (Array.isArray(body) ? body : (body?.data ?? []));
const day = (offset = 0) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
};
const uid = () => String(Date.now()).slice(-6) + String(Math.floor(Math.random() * 90) + 10);

const failures = [];
let checks = 0;
const step = (title) => console.log(`\n== ${title}`);
function expect(label, actual, expected) {
  checks += 1;
  const ok =
    typeof expected === 'number' ? money(actual) === money(expected) : actual === expected;
  if (!ok) {
    failures.push(`${label}: expected ${expected}, got ${actual}`);
    console.log(`   FAIL ${label}: expected ${expected}, got ${actual}`);
  }
  return ok;
}

async function api(token, method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const err = new Error(`${method} ${path} -> ${res.status} ${JSON.stringify(data)}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

async function login(email, password) {
  const data = await api(null, 'POST', '/api/auth/login', { email, password });
  if (!data?.token) throw new Error(`Login for ${email} returned no token`);
  console.log(`   ${email}: role ${data.user?.role}`);
  return data.token;
}

// ---------- ledger helpers ----------

let admin;
let accounts = new Map();
let accountsByPath = new Map();

async function loadAccounts() {
  const list = rows(await api(admin, 'GET', '/api/accounting/accounts?page=1&pageSize=5000'));
  accounts = new Map(list.map((a) => [a.id, a]));
  accountsByPath = new Map();
  for (const a of list) {
    const path = pathOf(a);
    accountsByPath.set(path, [...(accountsByPath.get(path) ?? []), a.id]);
  }
}

function pathOf(account) {
  const parent = account.parentAccount?.name;
  return parent ? `${parent} → ${account.name}` : account.name;
}

function accountId(ref) {
  if (typeof ref === 'number') return ref;
  const ids = accountsByPath.get(ref) ?? [];
  if (ids.length !== 1) throw new Error(`Account "${ref}" matches ${ids.length} accounts`);
  return ids[0];
}

const label = (id) => {
  const a = accounts.get(id);
  return a ? pathOf(a) : `#${id}`;
};

async function snapshot() {
  const tb = await api(admin, 'GET', '/api/accounting/reports/trial-balance?flat=true');
  expect('trial balance isBalanced', tb.isBalanced, true);
  expect('trial balance debit = credit', money(tb.grandTotalDebit), money(tb.grandTotalCredit));
  const map = new Map();
  for (const line of tb.lines ?? []) {
    map.set(line.accountId, { d: money(line.totalDebit), c: money(line.totalCredit) });
  }
  return { map, debit: money(tb.grandTotalDebit), credit: money(tb.grandTotalCredit) };
}

/** expected: Array<[accountRef, debit, credit]>; every other account must not move. */
async function checkStep(name, before, expected) {
  await loadAccounts();
  const after = await snapshot();
  const moved = after.debit - before.debit;
  expect(`${name}: posted debits = posted credits`, moved, after.credit - before.credit);

  const want = new Map();
  for (const [ref, d, c] of expected) {
    const id = accountId(ref);
    const cur = want.get(id) ?? { d: 0, c: 0 };
    want.set(id, { d: cur.d + d, c: cur.c + c });
  }
  const ids = new Set([...before.map.keys(), ...after.map.keys(), ...want.keys()]);
  for (const id of ids) {
    const b = before.map.get(id) ?? { d: 0, c: 0 };
    const a = after.map.get(id) ?? { d: 0, c: 0 };
    const delta = { d: money(a.d - b.d), c: money(a.c - b.c) };
    const w = want.get(id) ?? { d: 0, c: 0 };
    if (want.has(id)) {
      expect(`${name}: ${label(id)} debit`, delta.d, w.d);
      expect(`${name}: ${label(id)} credit`, delta.c, w.c);
      console.log(`   ${label(id)}: Dr ${delta.d} Cr ${delta.c}`);
    } else if (delta.d !== 0 || delta.c !== 0) {
      expect(`${name}: unexpected movement on ${label(id)}`, `Dr ${delta.d} Cr ${delta.c}`, 'none');
    }
  }
  return after;
}

async function checkTree() {
  const flat = await snapshot();
  const tb = await api(admin, 'GET', '/api/accounting/reports/trial-balance');
  const visit = (node) => {
    const kids = node.children ?? [];
    if (kids.length) {
      kids.forEach(visit);
      const own = flat.map.get(node.accountId) ?? { d: 0, c: 0 };
      const sumD = own.d + kids.reduce((s, k) => s + Number(k.totalDebit), 0);
      const sumC = own.c + kids.reduce((s, k) => s + Number(k.totalCredit), 0);
      expect(`parent ${node.accountName} debit = children`, money(node.totalDebit), money(sumD));
      expect(`parent ${node.accountName} credit = children`, money(node.totalCredit), money(sumC));
      if (own.d || own.c) {
        console.log(`   note: parent ${node.accountName} has direct postings Dr ${own.d} Cr ${own.c}`);
      }
    }
  };
  (tb.tree ?? []).forEach(visit);
  const rootD = (tb.tree ?? []).reduce((s, n) => s + Number(n.totalDebit), 0);
  const rootC = (tb.tree ?? []).reduce((s, n) => s + Number(n.totalCredit), 0);
  expect('tree roots debit = credit', money(rootD), money(rootC));

  await loadAccounts();
  for (const name of REMOVED_ACCOUNTS) {
    const left = [...accounts.values()].filter((a) => a.name === name);
    expect(`removed account ${name} is gone`, left.length, 0);
  }
  for (const [path] of Object.values(EXPENSE_LEAVES)) {
    expect(`expense leaf ${path} exists`, (accountsByPath.get(path) ?? []).length, 1);
  }
}

// ---------- flow helpers ----------

let emp;

async function askCustody(amount) {
  const request = await api(emp, 'POST', '/api/office-requests', {
    type: 'ASK_FOR_CUSTODY',
    amount,
  });
  await api(admin, 'POST', `/api/office-requests/${request.id}/request-action`, {
    status: 'APPROVED',
    custody: { amount },
  });
  console.log(`   request ${request.id} approved for ${amount}`);
}

async function endShift(journeyId, amount) {
  const request = await api(emp, 'POST', '/api/office-requests', {
    type: 'END_WORKING_SHIFT',
    journeyId,
  });
  await api(admin, 'POST', `/api/office-requests/${request.id}/request-action`, {
    status: 'APPROVED',
    custody: { amount },
  });
  console.log(`   request ${request.id} approved, ${amount} back to the treasury`);
}

async function employeeAccountId() {
  const balance = await api(emp, 'GET', '/api/journeys/office/custody-amount');
  return balance.accountId;
}

function policyBody(ctx, journeyId, extra = {}) {
  return {
    journeyId,
    deliveryAreaId: ctx.areaId,
    ...(ctx.govId ? { deliveryGovId: ctx.govId } : {}),
    bookWeight: BOOK_WEIGHT,
    actualWeight: BOOK_WEIGHT,
    policyNo: `TEST-${journeyId}-${Date.now()}`,
    policyDate: ctx.tripDay,
    tripDate: ctx.tripDay,
    policyFile: '',
    ...extra,
  };
}

async function ledgerLines(journeyId) {
  const ledger = await api(emp, 'GET', `/api/journey-policies/journey/${journeyId}/ledger`);
  for (const line of ledger.lines ?? []) {
    console.log(
      `   ${line.kind}${line.category ? ` ${line.category}` : ''}: ${line.amount}` +
        ` Dr ${line.debitPath} / Cr ${line.creditPath} posted=${line.alreadyPosted}`,
    );
  }
  for (const w of ledger.warnings ?? []) console.log(`   warning: ${w}`);
  return ledger.lines ?? [];
}

async function invoice(ctx, journeyId, name) {
  const body = {
    clientId: ctx.clientId,
    journeyIds: [journeyId],
    taxEnabled: true,
    vatPercentage: VAT,
    withholdingPercentage: WITHHOLDING,
  };
  const preview = await api(admin, 'POST', '/api/invoices/preview', body);
  const t = preview.totals;
  expect(`${name}: invoice revenue = TRN1`, t.totalRevenue, ctx.revenue);
  expect(`${name}: VAT ${VAT}%`, t.vatAmount, money((ctx.revenue * VAT) / 100));
  expect(`${name}: withholding ${WITHHOLDING}%`, t.withholdingAmount, money((ctx.revenue * WITHHOLDING) / 100));
  expect(`${name}: net = revenue + VAT - withholding`, t.netAmount, money(t.totalRevenue + t.vatAmount - t.withholdingAmount));
  const before = await snapshot();
  const issued = await api(admin, 'POST', '/api/invoices', body);
  console.log(`   invoice ${issued.id} ${issued.code ?? ''} net ${t.netAmount}`);
  await checkStep(
    `${name} invoice`,
    before,
    preview.lines.map((l) => [l.path, l.entryType === 'DEBIT' ? l.amount : 0, l.entryType === 'CREDIT' ? l.amount : 0]),
  );
  const again = await api(admin, 'POST', '/api/invoices', body).catch((err) => err);
  expect(`${name}: second invoice for the same trip is refused`, again?.status, 400);
  return { id: issued.id, net: t.netAmount };
}

// ---------- cycles ----------

async function companyCycle(ctx) {
  const name = 'company';
  const vehicle = ctx.vehicles.company;
  step('Company car: ask for custody');
  let before = await snapshot();
  await askCustody(ASKED_CUSTODY);
  const empAccount = await employeeAccountId();
  before = await checkStep('company ask custody', before, [
    [empAccount, ASKED_CUSTODY, 0],
    [TREASURY, 0, ASKED_CUSTODY],
  ]);

  step('Company car: create the trip with custody to the driver');
  const journey = await api(emp, 'POST', '/api/journeys/office', {
    vehicleMode: 'COMPANY_CAR',
    carId: vehicle.carId,
    trailerId: vehicle.trailerId,
    driverId: ctx.driverId,
    clientId: ctx.clientId,
    deliveryAreaId: ctx.areaId,
    custodyAmount: TRIP_CUSTODY,
  });
  console.log(`   journey ${journey.id} ${journey.delegateNumber ?? ''}`);
  const driverAccount = `${CUSTODY_PARENT} → ${ctx.driverName}`;
  before = await checkStep('company trip', before, [
    [driverAccount, TRIP_CUSTODY, 0],
    [empAccount, 0, TRIP_CUSTODY],
  ]);

  step('Company car: save the policy with the 4 expenses (TRN1 + TRN3)');
  const body = policyBody(ctx, journey.id, { expenses: EXPENSES });
  await api(emp, 'POST', '/api/journey-policies', body);
  const lines = await ledgerLines(journey.id);
  const trn1 = lines.find((l) => l.kind === 'TRN1');
  if (!trn1) throw new Error('No TRN1 line');
  ctx.revenue = money(trn1.amount);
  expect('company TRN1 posted', trn1.alreadyPosted, true);
  expect('company has no TRN2', lines.filter((l) => l.kind === 'TRN2').length, 0);
  const trn3 = lines.filter((l) => l.kind === 'TRN3');
  expect('company TRN3 lines', trn3.length, 4);
  for (const [category, [path, amount]] of Object.entries(EXPENSE_LEAVES)) {
    const line = trn3.find((l) => l.category === category);
    expect(`TRN3 ${category} amount`, line?.amount, amount);
    expect(`TRN3 ${category} debit`, line?.debitPath, path);
    expect(`TRN3 ${category} credit`, line?.creditPath, driverAccount);
    expect(`TRN3 ${category} posted`, line?.alreadyPosted, true);
  }
  before = await checkStep('company policy', before, [
    [trn1.debitPath, ctx.revenue, 0],
    [trn1.creditPath, 0, ctx.revenue],
    ...Object.values(EXPENSE_LEAVES).map(([path, amount]) => [path, amount, 0]),
    [driverAccount, 0, Object.values(EXPENSE_LEAVES).reduce((s, [, a]) => s + a, 0)],
  ]);

  step('Company car: policy form returns the expenses, all locked');
  const form = await api(emp, 'GET', `/api/journey-policies/journey/${journey.id}`);
  expect('form dieselFees', form.expenses?.dieselFees, EXPENSES.dieselFees);
  expect('form fuelLiters', form.expenses?.fuelLiters, EXPENSES.fuelLiters);
  expect('form cardFees', form.expenses?.cardFees, EXPENSES.cardFees);
  expect('form cardName', form.expenses?.cardName, EXPENSES.cardName);
  expect('form scaleFees', form.expenses?.scaleFees, EXPENSES.scaleFees);
  expect('form tipsFees', form.expenses?.tipsFees, EXPENSES.tipsFees);
  expect('form postedExpenses', [...(form.postedExpenses ?? [])].sort().join(','), Object.keys(EXPENSE_LEAVES).sort().join(','));

  step('Company car: re-save with a non-expense edit posts nothing');
  await api(emp, 'PUT', `/api/journey-policies/journey/${journey.id}`, { ...body, archiveNo: 'A1' });
  before = await checkStep('company re-save', before, []);
  const resaved = await api(emp, 'GET', `/api/journey-policies/journey/${journey.id}`);
  expect('re-save stored archiveNo', resaved.archiveNo, 'A1');

  step('Company car: changing a posted expense returns 400 and posts nothing');
  const changed = await api(emp, 'PUT', `/api/journey-policies/journey/${journey.id}`, {
    ...body,
    archiveNo: 'CHANGED',
    expenses: { ...EXPENSES, dieselFees: EXPENSES.dieselFees + 50 },
  }).catch((err) => err);
  expect('changed posted expense status', changed?.status, 400);
  console.log(`   ${changed?.status} ${JSON.stringify(changed?.data?.message ?? changed?.data ?? '')}`);
  const afterReject = await api(emp, 'GET', `/api/journey-policies/journey/${journey.id}`);
  expect('rejected save left archiveNo unchanged', afterReject.archiveNo, 'A1');
  expect('rejected save left dieselFees unchanged', afterReject.expenses?.dieselFees, EXPENSES.dieselFees);
  before = await checkStep('company rejected change', before, []);

  step('Company car: invoice');
  const issued = await invoice(ctx, journey.id, name);

  step('Company car: end the shift');
  before = await snapshot();
  await endShift(journey.id, ASKED_CUSTODY - TRIP_CUSTODY);
  await checkStep('company end shift', before, [
    [TREASURY, ASKED_CUSTODY - TRIP_CUSTODY, 0],
    [empAccount, 0, ASKED_CUSTODY - TRIP_CUSTODY],
  ]);
  return { mode: name, journeyId: journey.id, revenue: ctx.revenue, invoice: issued };
}

/** Nolon and contract cars: custody and the nolon (TRN2) go to the transport supplier. */
async function supplierCycle(ctx, name) {
  const { ownerShip } = VEHICLE_MODES[name];
  const vehicle = ctx.vehicles[name];
  const title = name === 'nolon' ? 'Nolon car' : 'Contract car';
  step(`${title}: ask for custody`);
  let before = await snapshot();
  await askCustody(ASKED_CUSTODY);
  const empAccount = await employeeAccountId();
  before = await checkStep(`${name} ask custody`, before, [
    [empAccount, ASKED_CUSTODY, 0],
    [TREASURY, 0, ASKED_CUSTODY],
  ]);

  step(`${title}: create the trip with custody to the transport supplier`);
  const journey = await api(emp, 'POST', '/api/journeys/office', {
    vehicleMode: ownerShip,
    carId: vehicle.carId,
    trailerId: vehicle.trailerId,
    driverId: ctx.driverId,
    clientId: ctx.clientId,
    deliveryAreaId: ctx.areaId,
    transportSupplierId: ctx.supplierId,
    custodyAmount: TRIP_CUSTODY,
  });
  console.log(`   journey ${journey.id} ${journey.delegateNumber ?? ''}`);
  const supplierAccount = `${TRANSPORT_SUPPLIER_PARENT} → ${ctx.supplierName}`;
  before = await checkStep(`${name} trip`, before, [
    [supplierAccount, TRIP_CUSTODY, 0],
    [empAccount, 0, TRIP_CUSTODY],
  ]);

  step(`${title}: save the policy (TRN1 + TRN2); expenses are ignored`);
  const body = policyBody(ctx, journey.id, { expenses: EXPENSES });
  await api(emp, 'POST', '/api/journey-policies', body);
  const lines = await ledgerLines(journey.id);
  const trn1 = lines.find((l) => l.kind === 'TRN1');
  const trn2 = lines.find((l) => l.kind === 'TRN2');
  if (!trn1 || !trn2) throw new Error('Missing TRN1 or TRN2 line');
  ctx.revenue = money(trn1.amount);
  const nolon = money(ctx.nolonPrice * BOOK_WEIGHT);
  expect(`${name} TRN1 posted`, trn1.alreadyPosted, true);
  expect(`${name} TRN2 = nolon per ton x tons`, trn2.amount, nolon);
  expect(`${name} TRN2 debit`, trn2.debitPath, NOLON_ACCOUNT);
  expect(`${name} TRN2 credit`, trn2.creditPath, supplierAccount);
  expect(`${name} TRN2 posted`, trn2.alreadyPosted, true);
  expect(`${name} has no TRN3`, lines.filter((l) => l.kind === 'TRN3').length, 0);
  before = await checkStep(`${name} policy`, before, [
    [trn1.debitPath, ctx.revenue, 0],
    [trn1.creditPath, 0, ctx.revenue],
    [NOLON_ACCOUNT, nolon, 0],
    [supplierAccount, 0, nolon],
  ]);
  const form = await api(emp, 'GET', `/api/journey-policies/journey/${journey.id}`);
  expect(`${name} form has no diesel`, form.expenses?.dieselFees ?? null, null);
  expect(`${name} form has no posted expenses`, (form.postedExpenses ?? []).length, 0);

  step(`${title}: re-save the same policy posts nothing`);
  await api(emp, 'PUT', `/api/journey-policies/journey/${journey.id}`, body);
  before = await checkStep(`${name} re-save`, before, []);

  step(`${title}: invoice`);
  const issued = await invoice(ctx, journey.id, name);

  step(`${title}: end the shift`);
  before = await snapshot();
  await endShift(journey.id, ASKED_CUSTODY - TRIP_CUSTODY);
  await checkStep(`${name} end shift`, before, [
    [TREASURY, ASKED_CUSTODY - TRIP_CUSTODY, 0],
    [empAccount, 0, ASKED_CUSTODY - TRIP_CUSTODY],
  ]);
  return { mode: name, journeyId: journey.id, revenue: ctx.revenue, nolon, invoice: issued };
}

// ---------- setup ----------

async function findOrCreate(what, find, create) {
  const existing = await find();
  if (existing) return existing;
  if (!SETUP) throw new Error(`No ${what} found; run with SETUP=1 to create one`);
  const created = await create();
  console.log(`   created ${what} ${created.id}`);
  return created;
}

async function employeeLogin() {
  try {
    return await login(env.EMP_EMAIL, env.EMP_PASSWORD);
  } catch (err) {
    if (!SETUP || err.status !== 401) throw err;
  }
  const branch = await findOrCreate(
    'branch',
    async () => rows(await api(admin, 'GET', '/api/branches?page=1&pageSize=100'))[0],
    () => api(admin, 'POST', '/api/branches', { name: 'الفرع الرئيسي' }),
  );
  const created = await api(admin, 'POST', '/api/employees', {
    branchId: branch.id,
    user: {
      email: env.EMP_EMAIL,
      password: env.EMP_PASSWORD,
      firstName: 'موظف',
      lastName: 'التشغيل',
      status: 'AVAILABLE',
    },
  });
  console.log(`   created employee ${created.id} (${env.EMP_EMAIL}) in branch ${branch.id}`);
  return login(env.EMP_EMAIL, env.EMP_PASSWORD);
}

/** Employee responses omit the branch, so fall back to the first one; trip creation rejects a mismatch. */
async function employeeBranchId() {
  const me = await api(emp, 'GET', '/api/journeys/office/custody-amount');
  const employees = rows(await api(admin, 'GET', '/api/employees?page=1&pageSize=500'));
  const known = employees.find((e) => e.id === me.employeeId)?.branch?.id;
  return known ?? rows(await api(admin, 'GET', '/api/branches?page=1&pageSize=100'))[0]?.id;
}

async function pickPrice(tripDay) {
  // The list is grouped government → areas → deliveryPrices and omits the client, so load matches by id.
  const grouped = rows(await api(admin, 'GET', '/api/delivery-prices?page=1&pageSize=500'));
  const candidates = grouped.flatMap((gov) =>
    (gov.areas ?? []).flatMap((area) =>
      (area.deliveryPrices ?? []).map((p) => ({ ...p, areaId: area.id, govId: gov.id })),
    ),
  );
  const covers = (p) =>
    String(p.validFrom).slice(0, 10) <= tripDay && tripDay <= String(p.validTo).slice(0, 10);
  const ordered = candidates
    .filter((c) => covers(c) && (!env.AREA_ID || c.areaId === Number(env.AREA_ID)))
    .sort((a, b) => Number(b.nolonPrice ?? 0) - Number(a.nolonPrice ?? 0));
  for (const candidate of ordered) {
    const full = await api(admin, 'GET', `/api/delivery-prices/${candidate.id}`);
    if (!full.client?.id || !full.area?.id) continue;
    if (env.CLIENT_ID && full.client.id !== Number(env.CLIENT_ID)) continue;
    if (!(Number(full.nolonPrice ?? 0) > 0)) continue;
    return { ...full, govId: full.area.government?.id ?? candidate.govId };
  }
  return undefined;
}

async function createPrice(tripDay) {
  const government = await findOrCreate(
    'government',
    async () => rows(await api(admin, 'GET', '/api/governments?page=1&pageSize=500'))[0],
    () => api(admin, 'POST', '/api/governments', { name: 'شمال سيناء' }),
  );
  const area = await findOrCreate(
    'area',
    async () =>
      rows(await api(admin, 'GET', '/api/areas?page=1&pageSize=500')).find(
        (a) => (a.government?.id ?? government.id) === government.id,
      ),
    () => api(admin, 'POST', '/api/areas', { name: 'العريش', governmentId: government.id }),
  );
  const client = await findOrCreate(
    'client',
    async () => rows(await api(admin, 'GET', '/api/clients?page=1&pageSize=500'))[0],
    () =>
      api(admin, 'POST', '/api/clients', {
        name: 'مصنع اسمنت العريش',
        commercialRecord: `CR-${uid()}`,
        pricingSheetKind: 'ARISH',
      }),
  );
  const year = Number(tripDay.slice(0, 4));
  await api(admin, 'POST', '/api/delivery-prices/bulk', {
    clientId: client.id,
    items: [
      {
        areaId: area.id,
        ...SETUP_PRICE,
        validFrom: `${year}-01-01`,
        validTo: `${year + 1}-12-31`,
      },
    ],
  });
  console.log(
    `   created delivery price for client ${client.id} area ${area.id}:` +
      ` ${SETUP_PRICE.basePrice}/ton, nolon ${SETUP_PRICE.nolonPrice}/ton`,
  );
}

function vehicleBody(kind, ownerShip, letters) {
  const id = uid();
  const base = {
    ownerShip,
    status: 'AVAILABLE',
    plateNumber: id.slice(-4),
    plateLetters: letters,
    licenseNumber: `LIC-${kind}-${id}`,
    licenseExpiryDate: day(365),
  };
  if (ownerShip === 'NOLON_CAR') return base;
  const common = {
    ...base,
    manufacturer: 'Mercedes',
    color: 'أبيض',
    chassisNumber: `CH-${kind}-${id}`,
    manufactureYear: 2022,
    axleCount: 3,
    maxWeight: kind === 'cars' ? 26 : 40,
  };
  return kind === 'cars'
    ? { ...common, model: 'Actros', cylinders: 6, horsepower: 450 }
    : { ...common, chaseType: 'سطح' };
}

async function ensureVehicle(kind, mode) {
  const { ownerShip, letters } = VEHICLE_MODES[mode];
  const available = (v) => v.ownerShip === ownerShip && ['AVAILABLE', 'ONROAD'].includes(v.status);
  const found = await findOrCreate(
    `${ownerShip} ${kind.slice(0, -1)}`,
    async () =>
      rows(await api(emp, 'GET', `/api/${kind}?page=1&pageSize=100&ownerShip=${ownerShip}`)).find(
        available,
      ),
    () => api(admin, 'POST', `/api/${kind}`, vehicleBody(kind, ownerShip, letters)),
  );
  return found.id;
}

async function ensureTreasury() {
  await loadAccounts();
  const treasury = accounts.get(accountId(TREASURY));
  const flat = await snapshot();
  const posted = flat.map.get(treasury.id) ?? { d: 0, c: 0 };
  const balance = money(Number(treasury.openingBalance ?? 0) + posted.d - posted.c);
  const needed = ASKED_CUSTODY * MODES.length;
  console.log(`   treasury balance ${balance} (opening ${Number(treasury.openingBalance ?? 0)})`);
  if (balance >= needed) return;
  if (!SETUP) throw new Error(`Treasury has ${balance}, needs ${needed}; run with SETUP=1 to fund it`);
  await api(admin, 'PUT', `/api/accounting/accounts/${treasury.id}/opening-balance`, {
    amount: Number(treasury.openingBalance ?? 0) + TREASURY_OPENING,
  });
  console.log(`   treasury opening balance raised by ${TREASURY_OPENING}`);
}

async function main() {
  for (const mode of MODES) {
    if (!VEHICLE_MODES[mode]) throw new Error(`Unknown mode "${mode}" in ONLY`);
  }

  step('Login');
  admin = await login(env.ADMIN_EMAIL, env.ADMIN_PASSWORD);
  emp = await employeeLogin();

  // Policy date must be after the delegation date (today), so price it for tomorrow.
  const tripDay = day(1);
  step(`Delivery price with a nolon rate valid on ${tripDay}`);
  let price = await pickPrice(tripDay);
  if (!price && SETUP) {
    await createPrice(tripDay);
    price = await pickPrice(tripDay);
  }
  if (!price) {
    throw new Error(`No delivery price with a client, an area and a nolon rate valid on ${tripDay}`);
  }
  const ctx = {
    tripDay,
    clientId: price.client.id,
    areaId: price.area.id,
    govId: price.govId,
    nolonPrice: Number(price.nolonPrice),
    vehicles: {},
  };
  console.log(
    `   price ${price.id}: client ${ctx.clientId} (${price.client.name}), area ${ctx.areaId}` +
      ` (${price.area.name}), nolon ${ctx.nolonPrice}/ton`,
  );

  step('Cars, trailers, driver and transport supplier');
  for (const mode of MODES) {
    ctx.vehicles[mode] = {
      carId: await ensureVehicle('cars', mode),
      trailerId: await ensureVehicle('trailers', mode),
    };
  }
  const driverRow = env.DRIVER_ID
    ? { id: Number(env.DRIVER_ID) }
    : await findOrCreate(
        'driver',
        async () => rows(await api(emp, 'GET', '/api/drivers?page=1&pageSize=100'))[0],
        () =>
          api(admin, 'POST', '/api/drivers', {
            licenseNumber: `DRV-${uid()}`,
            licenseExpiryDate: day(365),
            user: { firstName: 'سائق', lastName: 'تجربة', status: 'AVAILABLE' },
          }),
      );
  ctx.driverId = driverRow.id;
  const driver = await api(emp, 'GET', `/api/drivers/${ctx.driverId}`);
  const user = driver.user ?? driver;
  ctx.driverName =
    `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || `Driver ${ctx.driverId}`;

  if (MODES.some((m) => m !== 'company')) {
    const branchId = await employeeBranchId();
    const supplier = await findOrCreate(
      'transport supplier',
      async () => {
        const list = rows(await api(admin, 'GET', '/api/suppliers?page=1&pageSize=100'));
        return env.SUPPLIER_ID
          ? list.find((s) => s.id === Number(env.SUPPLIER_ID))
          : list.find(
              (s) => s.type === 'TRANSPORTATION' && (!branchId || !s.branch?.id || s.branch.id === branchId),
            );
      },
      () => {
        const id = uid();
        return api(admin, 'POST', '/api/suppliers', {
          name: 'مورد نقل تجربة',
          type: 'TRANSPORTATION',
          branchId,
          governmentId: ctx.govId,
          phone: `010${id}`.slice(0, 11),
          commercialRegister: `SCR-${id}`,
          taxCard: `STC-${id}`,
          taxRegistrationNumber: `STR-${id}`,
        });
      },
    );
    ctx.supplierId = supplier.id;
    ctx.supplierName = supplier.name.trim();
  }
  for (const mode of MODES) {
    const v = ctx.vehicles[mode];
    console.log(`   ${mode}: car ${v.carId}, trailer ${v.trailerId}`);
  }
  console.log(`   driver ${ctx.driverId} (${ctx.driverName})`);
  if (ctx.supplierId) console.log(`   transport supplier ${ctx.supplierId} (${ctx.supplierName})`);

  step('Treasury');
  await ensureTreasury();

  step('Ledger before');
  await checkTree();
  const start = await snapshot();
  console.log(`   trial balance: Dr ${start.debit} = Cr ${start.credit}`);

  if (env.DRY_RUN) {
    console.log('\nDRY_RUN set: stopping before creating anything.');
  } else {
    const results = [];
    if (MODES.includes('company')) results.push(await companyCycle({ ...ctx }));
    if (MODES.includes('nolon')) results.push(await supplierCycle({ ...ctx }, 'nolon'));
    if (MODES.includes('contract')) results.push(await supplierCycle({ ...ctx }, 'contract'));

    step('Ledger after');
    await checkTree();
    const end = await snapshot();
    console.log(`   trial balance: Dr ${end.debit} = Cr ${end.credit}`);

    step('Summary');
    for (const r of results) {
      console.log(
        `   ${r.mode.padEnd(8)} trip ${r.journeyId}: revenue ${r.revenue}` +
          `${r.nolon ? `, nolon ${r.nolon}` : ''}, invoice ${r.invoice.id} net ${r.invoice.net}` +
          `  ${BASE}/ar/trips/${r.journeyId}`,
      );
    }
  }

  console.log(`\n${checks} checks, ${failures.length} failed`);
  if (failures.length) {
    for (const f of failures) console.log(` - ${f}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(`\nFAILED: ${err.message}`);
  if (failures.length) for (const f of failures) console.error(` - ${f}`);
  process.exit(1);
});
