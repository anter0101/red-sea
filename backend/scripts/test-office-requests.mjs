/**
 * Setup minimal data + run office request integration tests.
 * Run: node scripts/test-office-requests.mjs
 */
const BASE = process.env.BASE_URL || 'http://localhost:8080';

async function request(method, path, { token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  return { status: res.status, data };
}

async function login(email, password) {
  const res = await request('POST', '/api/auth/login', { body: { email, password } });
  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`Login failed for ${email}: ${res.status} ${JSON.stringify(res.data)}`);
  }
  return res.data.token;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function ensureBranch(adminToken) {
  const branches = await request('GET', '/api/branches?page=1&pageSize=1', { token: adminToken });
  if (branches.data?.[0]?.id) return branches.data[0].id;

  const created = await request('POST', '/api/branches', {
    token: adminToken,
    body: { name: 'Test Branch', address: 'Test Address' },
  });
  if (created.status !== 201 && created.status !== 200) {
    throw new Error(`Create branch failed: ${JSON.stringify(created.data)}`);
  }
  return created.data.id;
}

async function ensureEmployee(adminToken, branchId, spec) {
  const list = await request('GET', '/api/employees?page=1&pageSize=100', { token: adminToken });
  const existing = (list.data ?? []).find((e) => e.user?.email === spec.email);
  if (existing) return existing;

  const created = await request('POST', '/api/employees', {
    token: adminToken,
    body: {
      branchId,
      user: {
        username: spec.username,
        email: spec.email,
        password: spec.password,
        firstName: spec.firstName,
        lastName: spec.lastName,
        role: spec.role,
        status: 'AVAILABLE',
      },
    },
  });

  if (created.status !== 201 && created.status !== 200) {
    throw new Error(`Create employee ${spec.email} failed: ${JSON.stringify(created.data)}`);
  }
  return created.data;
}

async function ensureJourney(adminToken, employeeToken, officeEmp) {
  const journeys = await request('GET', '/api/journeys?page=1&pageSize=1&sortField=id&sortOrder=DESC', {
    token: adminToken,
  });
  if (journeys.data?.[0]?.id) return journeys.data[0].id;

  const created = await request('POST', '/api/journeys/office', {
    token: employeeToken,
    body: {
      vehicleMode: 'COMPANY_CAR',
      clientId: 1,
      direction: 'Cairo',
      packingType: 'BAGGED',
      cementGrade: '42.5',
      quantity: 10,
      driverId: 1,
      carId: 1,
      trailerId: 1,
      receivedCompany: 'Test Co',
      sellingOrderNo: `SO-TEST-${Date.now()}`,
    },
  });

  if (created.status === 201 && created.data?.id) return created.data.id;

  // Fallback: any journey id 1
  return 1;
}

async function fundTreasury(adminToken, amount = 1_000_000) {
  const accounts = await request('GET', '/api/accounting/accounts?page=1&pageSize=300', { token: adminToken });
  const treasury = (accounts.data ?? []).find((a) => a.name === 'الخزينه');
  if (!treasury) throw new Error('Treasury account not found');
  if (treasury.openingBalanceLocked) return true;

  const res = await request('PUT', `/api/accounting/accounts/${treasury.id}/opening-balance`, {
    token: adminToken,
    body: { amount },
  });
  return res.status === 200;
}

async function fundTreasuryToEmployee(adminToken, employeeId, amount) {
  const res = await request('POST', `/api/employees/${employeeId}/custody`, {
    token: adminToken,
    body: { amount },
  });
  return res.status === 201 || res.status === 200;
}

async function main() {
  const results = [];
  const log = (name, ok, detail = '') => {
    results.push({ name, ok, detail });
    console.log(`${ok ? 'PASS' : 'FAIL'} — ${name}${detail ? `: ${detail}` : ''}`);
  };

  console.log(`Testing against ${BASE}\n`);

  const adminToken = await login('admin@admin.com', '12345');
  log('Admin login', true);

  const branchId = await ensureBranch(adminToken);

  const adminEmp = await ensureEmployee(adminToken, branchId, {
    username: 'admin-emp',
    email: 'admin.emp@test.com',
    password: '12345',
    firstName: 'Admin',
    lastName: 'Employee',
    role: 'ADMIN',
  });
  log('Ensure admin employee', !!adminEmp.id, `id=${adminEmp.id}`);

  const officeEmp1 = await ensureEmployee(adminToken, branchId, {
    username: 'office-emp-1',
    email: 'office1@test.com',
    password: '12345',
    firstName: 'Office',
    lastName: 'One',
    role: 'EMPLOYEE',
  });
  log('Ensure office employee 1', !!officeEmp1.id, `id=${officeEmp1.id}`);

  const officeEmp2 = await ensureEmployee(adminToken, branchId, {
    username: 'office-emp-2',
    email: 'office2@test.com',
    password: '12345',
    firstName: 'Office',
    lastName: 'Two',
    role: 'EMPLOYEE',
  });
  log('Ensure office employee 2', !!officeEmp2.id, `id=${officeEmp2.id}`);

  const employeeToken = await login('office1@test.com', '12345');
  log('Employee login', true, 'office1@test.com');

  const journeyId = await ensureJourney(adminToken, employeeToken, officeEmp1);
  log('Ensure journey', !!journeyId, `journeyId=${journeyId}`);

  const treasuryFunded = await fundTreasury(adminToken);
  log('Fund treasury opening balance', treasuryFunded, '1000000');

  const funded1 = await fundTreasuryToEmployee(adminToken, officeEmp1.id, 10000);
  log('Fund office emp 1 custody', funded1, '10000 from treasury');

  const funded2 = await fundTreasuryToEmployee(adminToken, officeEmp2.id, 10000);
  log('Fund office emp 2 custody', funded2, '10000 from treasury');

  const custodyAmount = 100;

  async function createRequest(type, extra = {}) {
    let body = { type, ...extra };
    if (type === 'PRINT_DELEGATION') {
      body = { type, journeyId };
    } else if (type === 'ASK_FOR_CUSTODY') {
      body = { type, amount: extra.amount ?? 5000 };
    } else if (type === 'END_WORKING_SHIFT') {
      body = { type };
      if (extra.note) body.note = extra.note;
    }
    return request('POST', '/api/office-requests', {
      token: employeeToken,
      body,
    });
  }

  function okStatus(status) {
    return status === 200 || status === 201;
  }

  async function approve(id, body) {
    return request('POST', `/api/office-requests/${id}/request-action`, {
      token: adminToken,
      body,
    });
  }

  // 1. PRINT_DELEGATION
  {
    const created = await createRequest('PRINT_DELEGATION');
    const ok = created.status === 201 && created.data?.status === 'PENDING';
    log('Create PRINT_DELEGATION', ok, created.data?.id ? `id=${created.data.id}` : JSON.stringify(created.data));

    if (ok) {
      const approved = await approve(created.data.id, { status: 'APPROVED' });
      log(
        'Approve PRINT_DELEGATION',
        okStatus(approved.status) && approved.data?.status === 'APPROVED',
        approved.data?.status ?? JSON.stringify(approved.data),
      );
    }
  }

  // 2. Reject
  {
    const created = await createRequest('END_WORKING_SHIFT', { note: 'Test reject' });
    log(
      'Create END_WORKING_SHIFT without journeyId',
      created.status === 201 && !created.data?.journey,
      created.status === 201 ? 'no journey on response' : JSON.stringify(created.data),
    );
    if (created.status === 201) {
      const rejected = await approve(created.data.id, { status: 'REJECTED' });
      log(
        'Reject END_WORKING_SHIFT',
        okStatus(rejected.status) && rejected.data?.status === 'REJECTED',
        rejected.data?.status,
      );
    }
  }

  // 3. ASK_FOR_CUSTODY from treasury
  {
    const created = await createRequest('ASK_FOR_CUSTODY', { amount: custodyAmount });
    log(
      'Create ASK_FOR_CUSTODY without journeyId',
      created.status === 201 && !created.data?.journey,
      created.status === 201 ? 'no journey on response' : JSON.stringify(created.data),
    );
    if (created.status === 201) {
      const approved = await approve(created.data.id, {
        status: 'APPROVED',
        custody: { amount: custodyAmount, transferFrom: 'TREASURY' },
      });
      log(
        'Approve ASK_FOR_CUSTODY ← Treasury',
        okStatus(approved.status) && approved.data?.status === 'APPROVED',
        okStatus(approved.status) ? `amount=${custodyAmount}` : JSON.stringify(approved.data),
      );
    } else {
      log('Create ASK_FOR_CUSTODY', false, JSON.stringify(created.data));
    }
  }

  // 4. END_WORKING_SHIFT → treasury
  {
    const created = await createRequest('END_WORKING_SHIFT', { note: 'Test end shift treasury' });
    if (created.status === 201) {
      const approved = await approve(created.data.id, {
        status: 'APPROVED',
        custody: { amount: custodyAmount, transferTo: 'TREASURY' },
      });
      log(
        'Approve END_WORKING_SHIFT → Treasury',
        okStatus(approved.status) && approved.data?.status === 'APPROVED',
        okStatus(approved.status) ? `amount=${custodyAmount}` : JSON.stringify(approved.data),
      );
    } else {
      log('Create END_WORKING_SHIFT', false, JSON.stringify(created.data));
    }
  }

  // 5. END_WORKING_SHIFT → employee
  {
    const created = await createRequest('END_WORKING_SHIFT', { note: 'Test end shift to emp2' });
    if (created.status === 201) {
      const approved = await approve(created.data.id, {
        status: 'APPROVED',
        custody: {
          amount: custodyAmount,
          transferTo: 'EMPLOYEE',
          targetEmployeeId: officeEmp2.id,
        },
      });
      log(
        'Approve END_WORKING_SHIFT → Employee',
        okStatus(approved.status) && approved.data?.status === 'APPROVED',
        okStatus(approved.status) ? `target=${officeEmp2.id}` : JSON.stringify(approved.data),
      );
    }
  }

  // 6. ASK_FOR_CUSTODY from employee
  {
    const created = await createRequest('ASK_FOR_CUSTODY', { amount: custodyAmount });
    if (created.status === 201) {
      const approved = await approve(created.data.id, {
        status: 'APPROVED',
        custody: {
          amount: custodyAmount,
          transferFrom: 'EMPLOYEE',
          sourceEmployeeId: officeEmp2.id,
        },
      });
      log(
        'Approve ASK_FOR_CUSTODY ← Employee',
        okStatus(approved.status) && approved.data?.status === 'APPROVED',
        okStatus(approved.status) ? `source=${officeEmp2.id}` : JSON.stringify(approved.data),
      );
    }
  }

  // 7. Validation
  {
    const created = await createRequest('ASK_FOR_CUSTODY', { amount: custodyAmount });
    if (created.status === 201) {
      const bad = await approve(created.data.id, { status: 'APPROVED' });
      log(
        'Validation: missing custody returns 400',
        bad.status === 400,
        `status=${bad.status} msg=${bad.data?.message ?? ''}`,
      );
    }
  }

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n--- Summary: ${passed} passed, ${failed} failed ---`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
