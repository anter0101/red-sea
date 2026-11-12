#!/usr/bin/env node
// Full accounting check against a running API. Runs two trip cycles and checks the ledger after
// every step:
//   company car: ask custody → trip (custody to the driver) → policy with expenses (TRN1 + TRN3)
//                → invoice → end shift
//   nolon car:   ask custody → trip (custody to the transport supplier) → policy (TRN1 + TRN2)
//                → invoice → end shift
//
// After each step the trial balance must stay balanced and every account must move by exactly the
// expected amount (any other movement fails). Re-saving a policy must post nothing, and changing a
// posted expense must return 400.
//
// It creates REAL data (requests, trips, policies, ledger entries, invoices) on the target.
//
// Usage (bash):
//   BASE_URL=http://localhost:4040 \
//   EMP_EMAIL=... EMP_PASSWORD=... ADMIN_EMAIL=... ADMIN_PASSWORD=... \
//   node backend/scripts/full-cycle.mjs
//
// Optional: CLIENT_ID, AREA_ID, COMPANY_CAR_ID, NOLON_CAR_ID, COMPANY_TRAILER_ID, NOLON_TRAILER_ID,
//           DRIVER_ID, SUPPLIER_ID, ONLY=company|nolon, CREATE_TRAILER=1 (add a test company
//           trailer when none is available), DRY_RUN=1 (read-only checks, creates nothing).

const env = process.env;
const BASE = (env.BASE_URL ?? '').replace(/\/$/, '');
for (const key of ['BASE_URL', 'EMP_EMAIL', 'EMP_PASSWORD', 'ADMIN_EMAIL', 'ADMIN_PASSWORD']) {
  if (!env[key]) {
    console.error(`Missing env ${key}`);
    process.exit(1);
  }
}

const BOOK_WEIGHT = 10;
const ASKED_CUSTODY = 600;
const TRIP_CUSTODY = 500;
const VAT = 14;
const WITHHOLDING = 1;
const EXPENSES = { dieselFees: 300, fuelLiters: 25, cardFees: 50, cardName: 'TEST', scaleFees: 30, tipsFees: 20 };

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

const num = (v) => (v == null || v === '' ? undefined : Number(v));
const money = (v) => Math.round(Number(v ?? 0) * 100) / 100;
const rows = (body) => (Array.isArray(body) ? body : (body?.data ?? []));
const day = (offset = 0) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
};

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
  return issued;
}

// ---------- cycles ----------

async function companyCycle(ctx) {
  const name = 'company';
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
    carId: ctx.companyCarId,
    trailerId: ctx.companyTrailerId,
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
  await invoice(ctx, journey.id, name);

  step('Company car: end the shift');
  before = await snapshot();
  await endShift(journey.id, ASKED_CUSTODY - TRIP_CUSTODY);
  await checkStep('company end shift', before, [
    [TREASURY, ASKED_CUSTODY - TRIP_CUSTODY, 0],
    [empAccount, 0, ASKED_CUSTODY - TRIP_CUSTODY],
  ]);
  return journey.id;
}

async function nolonCycle(ctx) {
  const name = 'nolon';
  step('Nolon car: ask for custody');
  let before = await snapshot();
  await askCustody(ASKED_CUSTODY);
  const empAccount = await employeeAccountId();
  before = await checkStep('nolon ask custody', before, [
    [empAccount, ASKED_CUSTODY, 0],
    [TREASURY, 0, ASKED_CUSTODY],
  ]);

  step('Nolon car: create the trip with custody to the transport supplier');
  const journey = await api(emp, 'POST', '/api/journeys/office', {
    vehicleMode: 'NOLON_CAR',
    carId: ctx.nolonCarId,
    trailerId: ctx.nolonTrailerId,
    driverId: ctx.driverId,
    clientId: ctx.clientId,
    deliveryAreaId: ctx.areaId,
    transportSupplierId: ctx.supplierId,
    custodyAmount: TRIP_CUSTODY,
  });
  console.log(`   journey ${journey.id} ${journey.delegateNumber ?? ''}`);
  const supplierAccount = `${TRANSPORT_SUPPLIER_PARENT} → ${ctx.supplierName}`;
  before = await checkStep('nolon trip', before, [
    [supplierAccount, TRIP_CUSTODY, 0],
    [empAccount, 0, TRIP_CUSTODY],
  ]);

  step('Nolon car: save the policy (TRN1 + TRN2); expenses are ignored');
  const body = policyBody(ctx, journey.id, { expenses: EXPENSES });
  await api(emp, 'POST', '/api/journey-policies', body);
  const lines = await ledgerLines(journey.id);
  const trn1 = lines.find((l) => l.kind === 'TRN1');
  const trn2 = lines.find((l) => l.kind === 'TRN2');
  if (!trn1 || !trn2) throw new Error('Missing TRN1 or TRN2 line');
  ctx.revenue = money(trn1.amount);
  const nolon = money(ctx.nolonPrice * BOOK_WEIGHT);
  expect('nolon TRN2 = nolon per ton x tons', trn2.amount, nolon);
  expect('nolon TRN2 debit', trn2.debitPath, NOLON_ACCOUNT);
  expect('nolon TRN2 credit', trn2.creditPath, supplierAccount);
  expect('nolon has no TRN3', lines.filter((l) => l.kind === 'TRN3').length, 0);
  before = await checkStep('nolon policy', before, [
    [trn1.debitPath, ctx.revenue, 0],
    [trn1.creditPath, 0, ctx.revenue],
    [NOLON_ACCOUNT, nolon, 0],
    [supplierAccount, 0, nolon],
  ]);
  const form = await api(emp, 'GET', `/api/journey-policies/journey/${journey.id}`);
  expect('nolon form has no diesel', form.expenses?.dieselFees ?? null, null);
  expect('nolon form has no posted expenses', (form.postedExpenses ?? []).length, 0);

  step('Nolon car: re-save the same policy posts nothing');
  await api(emp, 'PUT', `/api/journey-policies/journey/${journey.id}`, body);
  before = await checkStep('nolon re-save', before, []);

  step('Nolon car: invoice');
  await invoice(ctx, journey.id, name);

  step('Nolon car: end the shift');
  before = await snapshot();
  await endShift(journey.id, ASKED_CUSTODY - TRIP_CUSTODY);
  await checkStep('nolon end shift', before, [
    [TREASURY, ASKED_CUSTODY - TRIP_CUSTODY, 0],
    [empAccount, 0, ASKED_CUSTODY - TRIP_CUSTODY],
  ]);
  return journey.id;
}

// ---------- setup ----------

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
  throw new Error(`No delivery price with a client, an area and a nolon price valid on ${tripDay}`);
}

async function main() {
  step('Login');
  emp = await login(env.EMP_EMAIL, env.EMP_PASSWORD);
  admin = await login(env.ADMIN_EMAIL, env.ADMIN_PASSWORD);

  // Policy date must be after the delegation date (today), so price it for tomorrow.
  const tripDay = day(1);
  step(`Pick a delivery price with a nolon rate valid on ${tripDay}`);
  const price = await pickPrice(tripDay);
  const ctx = {
    tripDay,
    clientId: price.client.id,
    areaId: price.area.id,
    govId: price.govId,
    nolonPrice: Number(price.nolonPrice),
  };
  console.log(
    `   price ${price.id}: client ${ctx.clientId} (${price.client.name}), area ${ctx.areaId}` +
      ` (${price.area.name}), nolon ${ctx.nolonPrice}/ton`,
  );

  step('Pick cars, trailers, driver and transport supplier');
  const available = (v) => ['AVAILABLE', 'ONROAD'].includes(v.status);
  const vehicleOf = async (kind, ownerShip) =>
    rows(await api(emp, 'GET', `/api/${kind}?page=1&pageSize=100&ownerShip=${ownerShip}`)).find(
      (v) => v.ownerShip === ownerShip && available(v),
    )?.id;
  ctx.companyCarId = num(env.COMPANY_CAR_ID) ?? (await vehicleOf('cars', 'COMPANY_CAR'));
  ctx.nolonCarId = num(env.NOLON_CAR_ID) ?? (await vehicleOf('cars', 'NOLON_CAR'));
  ctx.companyTrailerId =
    num(env.COMPANY_TRAILER_ID) ?? (await vehicleOf('trailers', 'COMPANY_CAR'));
  ctx.nolonTrailerId = num(env.NOLON_TRAILER_ID) ?? (await vehicleOf('trailers', 'NOLON_CAR'));
  if (!ctx.companyTrailerId && env.CREATE_TRAILER && !env.DRY_RUN) {
    const trailer = await api(admin, 'POST', '/api/trailers', {
      ownerShip: 'COMPANY_CAR',
      status: 'AVAILABLE',
      chaseType: 'TEST',
      manufacturer: 'TEST',
      manufactureYear: 2024,
      color: 'TEST',
      axleCount: 2,
      maxWeight: 40,
      plateNumber: String(Date.now()).slice(-4),
      plateLetters: 'ت س ت',
      chassisNumber: `TEST-${Date.now()}`,
      licenseNumber: `TEST-${Date.now()}`,
      licenseExpiryDate: day(365),
    });
    ctx.companyTrailerId = trailer.id;
    console.log(`   created company trailer ${trailer.id}`);
  }
  if (!ctx.companyTrailerId || !ctx.nolonTrailerId) {
    throw new Error(
      'Missing an available COMPANY_CAR or NOLON_CAR trailer; set COMPANY_TRAILER_ID/NOLON_TRAILER_ID' +
        ' or CREATE_TRAILER=1 to add a test company trailer',
    );
  }
  ctx.driverId =
    num(env.DRIVER_ID) ?? rows(await api(emp, 'GET', '/api/drivers?page=1&pageSize=100'))[0]?.id;
  if (!ctx.companyCarId || !ctx.nolonCarId || !ctx.driverId) {
    throw new Error('Missing a COMPANY_CAR car, a NOLON_CAR car or a driver');
  }
  const driver = await api(emp, 'GET', `/api/drivers/${ctx.driverId}`);
  const user = driver.user ?? driver;
  ctx.driverName =
    `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || `Driver ${ctx.driverId}`;
  const suppliers = rows(await api(admin, 'GET', '/api/suppliers?page=1&pageSize=100'));
  const supplier = env.SUPPLIER_ID
    ? suppliers.find((s) => s.id === Number(env.SUPPLIER_ID))
    : suppliers.find((s) => s.type === 'TRANSPORTATION');
  if (!supplier) throw new Error('No TRANSPORTATION supplier; set SUPPLIER_ID');
  ctx.supplierId = supplier.id;
  ctx.supplierName = supplier.name.trim();
  console.log(
    `   company car ${ctx.companyCarId} trailer ${ctx.companyTrailerId},` +
      ` nolon car ${ctx.nolonCarId} trailer ${ctx.nolonTrailerId},` +
      ` driver ${ctx.driverId} (${ctx.driverName}), supplier ${ctx.supplierId} (${ctx.supplierName})`,
  );

  step('Ledger before');
  await loadAccounts();
  await checkTree();
  const start = await snapshot();
  console.log(`   trial balance: Dr ${start.debit} = Cr ${start.credit}`);

  if (env.DRY_RUN) {
    console.log('\nDRY_RUN set: stopping before creating anything.');
  } else {
    const journeys = [];
    if (env.ONLY !== 'nolon') journeys.push(await companyCycle({ ...ctx }));
    if (env.ONLY !== 'company') journeys.push(await nolonCycle({ ...ctx }));

    step('Ledger after');
    await checkTree();
    const end = await snapshot();
    console.log(`   trial balance: Dr ${end.debit} = Cr ${end.credit}`);
    for (const id of journeys) console.log(`   trip: ${BASE}/ar/trips/${id}`);
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
