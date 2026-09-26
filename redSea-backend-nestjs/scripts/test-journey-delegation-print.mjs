/**
 * Integration tests for journey delegation print module.
 * Run: node scripts/test-journey-delegation-print.mjs
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

function okStatus(status) {
  return status === 200 || status === 201;
}

async function main() {
  const results = [];
  const log = (name, ok, detail = '') => {
    results.push({ name, ok, detail });
    console.log(`${ok ? 'PASS' : 'FAIL'} — ${name}${detail ? `: ${detail}` : ''}`);
  };

  console.log(`Testing journey delegation print against ${BASE}\n`);

  const adminToken = await login('admin@admin.com', '12345');
  log('Admin login', true);

  let employeeToken;
  try {
    employeeToken = await login('office1@test.com', '12345');
    log('Employee login', true, 'office1@test.com');
  } catch {
    employeeToken = adminToken;
    log('Employee login', false, 'Using admin token fallback');
  }

  const journeys = await request(
    'GET',
    '/api/journeys?page=1&pageSize=1&sortField=id&sortOrder=DESC',
    { token: adminToken },
  );
  let journeyId = journeys.data?.[0]?.id;

  const getState = (id) =>
    request('GET', `/api/journey-delegation-prints/${id}`, { token: adminToken });

  if (journeyId) {
    const probe = await getState(journeyId);
    if (probe.status === 404) {
      journeyId = undefined;
    }
  }

  if (!journeyId) {
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
        sellingOrderNo: `SO-DELEG-${Date.now()}`,
      },
    });
    journeyId = created.data?.id;
    log(
      'Create office journey with delegation record',
      created.status === 201 && !!journeyId,
      journeyId ? `id=${journeyId}` : JSON.stringify(created.data),
    );
  } else {
    log('Find journey with delegation record', true, `id=${journeyId}`);
  }

  if (!journeyId) {
    console.log('\nNo journey available — skipping remaining tests');
    process.exit(1);
  }

  const getStateForJourney = () => getState(journeyId);

  let state = await getStateForJourney();

  log(
    'GET delegation print state',
    okStatus(state.status) && state.data?.canPrint !== undefined,
    JSON.stringify({ status: state.data?.status, canPrint: state.data?.canPrint }),
  );

  if (state.data?.status === 'PRINTED') {
    const createReq = await request('POST', '/api/office-requests', {
      token: employeeToken,
      body: {
        type: 'PRINT_DELEGATION',
        journeyId,
      },
    });
    if (createReq.status === 201) {
      const approve = await request(
        'POST',
        `/api/office-requests/${createReq.data.id}/request-action`,
        { token: adminToken, body: { status: 'APPROVED' } },
      );
      log(
        'Reset via PRINT_DELEGATION approve',
        okStatus(approve.status),
        approve.data?.status ?? JSON.stringify(approve.data),
      );
      state = await getStateForJourney();
    }
  }

  if (state.data?.canPrint === true) {
    const mark = await request(
      'POST',
      `/api/journey-delegation-prints/${journeyId}/mark-printed`,
      { token: employeeToken },
    );
    log(
      'POST mark printed',
      okStatus(mark.status) && mark.data?.status === 'PRINTED' && mark.data?.canPrint === false,
      JSON.stringify({ status: mark.data?.status, canPrint: mark.data?.canPrint }),
    );

    const duplicate = await request(
      'POST',
      `/api/journey-delegation-prints/${journeyId}/mark-printed`,
      { token: employeeToken },
    );
    log(
      'POST mark printed again returns 400',
      duplicate.status === 400,
      `status=${duplicate.status}`,
    );
  } else {
    log('POST mark printed', false, 'canPrint was not true');
  }

  const createReq = await request('POST', '/api/office-requests', {
    token: employeeToken,
    body: {
      type: 'PRINT_DELEGATION',
      journeyId,
    },
  });
  log('Create PRINT_DELEGATION request', createReq.status === 201, `id=${createReq.data?.id}`);

  if (createReq.status === 201) {
    const approve = await request(
      'POST',
      `/api/office-requests/${createReq.data.id}/request-action`,
      { token: adminToken, body: { status: 'APPROVED' } },
    );
    log('Approve PRINT_DELEGATION', okStatus(approve.status), approve.data?.status);

    const afterApprove = await getStateForJourney();
    log(
      'GET after approve — canPrint true',
      okStatus(afterApprove.status) &&
        afterApprove.data?.status === 'NOT_PRINTED' &&
        afterApprove.data?.canPrint === true,
      JSON.stringify(afterApprove.data),
    );
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
