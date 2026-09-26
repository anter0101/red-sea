/**
 * Smoke-test GET endpoints; report 500 responses.
 * Usage: node scripts/api-smoke-test.mjs
 */
const BASE = process.env.BASE_URL || 'http://localhost:8080';

async function login(email, password) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Login failed ${email}: ${JSON.stringify(data)}`);
  return data.token;
}

async function request(method, path, token, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

/** GET list endpoints (admin token unless noted) */
const LIST_GETS = [
  '/api/branches?page=1&pageSize=5',
  '/api/employees?page=1&pageSize=5',
  '/api/drivers?page=1&pageSize=5',
  '/api/users?page=1&pageSize=5&role=DRIVER_ASSISTANT',
  '/api/cars?page=1&pageSize=5',
  '/api/trailers?page=1&pageSize=5',
  '/api/clients?page=1&pageSize=5',
  '/api/custodies?page=1&pageSize=5',
  '/api/warehouses?page=1&pageSize=5',
  '/api/suppliers?page=1&pageSize=5',
  '/api/salaries?page=1&pageSize=5',
  '/api/accounts?page=1&pageSize=5',
  '/api/transactions?page=1&pageSize=5',
  '/api/transaction-lines?page=1&pageSize=5',
  '/api/journeys?page=1&pageSize=5',
  '/api/journey-transactions?page=1&pageSize=5',
  '/api/journey-policies?page=1&pageSize=5',
  '/api/journey-attachments?page=1&pageSize=5',
  '/api/office-requests?page=1&pageSize=5',
  '/api/price-types?page=1&pageSize=5',
  '/api/areas?page=1&pageSize=5',
  '/api/governments?page=1&pageSize=5',
  '/api/owners?page=1&pageSize=5',
  '/api/delivery-prices?page=1&pageSize=5',
  '/api/car-models?page=1&pageSize=5',
  '/api/car-manufacturers?page=1&pageSize=5',
  '/api/trailer-manufacturers?page=1&pageSize=5',
  '/api/tire-models?page=1&pageSize=5',
  '/api/gps-devices?page=1&pageSize=5',
  '/api/gps-tails?page=1&pageSize=5',
  '/api/grids?page=1&pageSize=5',
  '/api/financial-stats/ledger?page=1&pageSize=5',
  '/api/financial-stats/trial-balance',
  '/api/financial-stats/income-statement',
  '/api/financial-stats/balance-sheet',
];

const EMPLOYEE_GETS = ['/api/journeys/office/custody-amount'];

async function firstId(listPath, token, idField = 'id') {
  const { status, data } = await request('GET', listPath, token);
  if (status !== 200 || !Array.isArray(data) || data.length === 0) return 1;
  return data[0][idField] ?? 1;
}

async function main() {
  console.log(`API smoke test → ${BASE}\n`);
  const adminToken = await login('admin@admin.com', '12345');
  let employeeToken;
  try {
    employeeToken = await login('office1@test.com', '12345');
  } catch {
    employeeToken = null;
  }

  const errors500 = [];
  const otherErrors = [];

  for (const path of LIST_GETS) {
    const { status, data } = await request('GET', path, adminToken);
    if (status === 500) errors500.push({ method: 'GET', path, status, message: data?.message ?? data });
    else if (status >= 400) otherErrors.push({ method: 'GET', path, status, message: data?.message ?? data });
    else process.stdout.write('.');
  }

  if (employeeToken) {
    for (const path of EMPLOYEE_GETS) {
      const { status, data } = await request('GET', path, employeeToken);
      if (status === 500) errors500.push({ method: 'GET', path, status, message: data?.message ?? data });
      else if (status >= 400) otherErrors.push({ method: 'GET', path, status, message: data?.message ?? data });
      else process.stdout.write('.');
    }
  }

  const journeyId = await firstId('/api/journeys?page=1&pageSize=1&sortField=id&sortOrder=DESC', adminToken);
  const byIdGets = [
    `/api/branches/1`,
    `/api/employees/1`,
    `/api/drivers/1`,
    `/api/users/1`,
    `/api/journeys/${journeyId}`,
    `/api/journeys/${journeyId}/employees`,
    `/api/journeys/${journeyId}/vehicles`,
    `/api/journeys/${journeyId}/info`,
    `/api/journey-delegation-print/${journeyId}`,
    `/api/accounts/1`,
    `/api/office-requests/1`,
  ];

  for (const path of byIdGets) {
    const token = path.includes('office/custody') ? employeeToken : adminToken;
    const { status, data } = await request('GET', path, token ?? adminToken);
    if (status === 500) errors500.push({ method: 'GET', path, status, message: data?.message ?? data });
    else if (status >= 400 && status !== 404) {
      otherErrors.push({ method: 'GET', path, status, message: data?.message ?? data });
    } else process.stdout.write('.');
  }

  // POST branch (known fix verification)
  const branchName = `Smoke Branch ${Date.now()}`;
  const branchRes = await request('POST', '/api/branches', adminToken, { name: branchName });
  if (branchRes.status === 500) errors500.push({ method: 'POST', path: '/api/branches', ...branchRes });
  else if (branchRes.status >= 400) otherErrors.push({ method: 'POST', path: '/api/branches', ...branchRes });
  else process.stdout.write('.');

  console.log('\n');
  if (errors500.length) {
    console.log('=== 500 ERRORS ===');
    for (const e of errors500) {
      console.log(`${e.method} ${e.path} → ${JSON.stringify(e.message ?? e.data)}`);
    }
  } else {
    console.log('No 500 errors on smoke GET/POST checks.');
  }

  if (otherErrors.length) {
    console.log(`\n=== Other 4xx (${otherErrors.length}, sample) ===`);
    for (const e of otherErrors.slice(0, 15)) {
      console.log(`${e.method} ${e.path} [${e.status}] → ${JSON.stringify(e.message)}`);
    }
  }

  process.exit(errors500.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
