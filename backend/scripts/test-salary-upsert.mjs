/**
 * Verify POST /api/salaries upserts when salary already exists for userId.
 * Run: node scripts/test-salary-upsert.mjs
 */
const BASE = process.env.BASE_URL || 'http://localhost:8080';

async function request(method, path, { token, body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

  return { status: res.status, data };
}

async function login(email, password) {
  const res = await request('POST', '/api/auth/login', { body: { email, password } });
  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`Login failed for ${email}: ${res.status} ${JSON.stringify(res.data)}`);
  }
  return res.data.token;
}

async function main() {
  const results = [];
  const log = (name, ok, detail = '') => {
    results.push({ name, ok, detail });
    console.log(`${ok ? 'PASS' : 'FAIL'} — ${name}${detail ? `: ${detail}` : ''}`);
  };

  console.log(`Testing salary upsert against ${BASE}\n`);

  const adminToken = await login('admin@admin.com', '12345');

  const driversRes = await request('GET', '/api/drivers?page=1&pageSize=5', { token: adminToken });
  if (driversRes.status !== 200 || !Array.isArray(driversRes.data) || driversRes.data.length === 0) {
    throw new Error(`No drivers available for test: ${driversRes.status} ${JSON.stringify(driversRes.data)}`);
  }

  const driver = driversRes.data[0];
  const userId = driver?.user?.id;

  if (!userId) {
    throw new Error(`Driver response missing userId: ${JSON.stringify(driver)}`);
  }

  const firstSalaryRes = await request('POST', '/api/salaries', {
    token: adminToken,
    body: {
      salaryType: 'MONTHLY',
      salaryAmount: 200,
      userId,
    },
  });

  const firstOk =
    (firstSalaryRes.status === 200 || firstSalaryRes.status === 201) &&
    firstSalaryRes.data?.id != null;

  log(
    'POST salary first time → create or upsert',
    firstOk,
    `status=${firstSalaryRes.status}, id=${firstSalaryRes.data?.id}, amount=${firstSalaryRes.data?.salaryAmount}`,
  );

  const secondSalaryRes = await request('POST', '/api/salaries', {
    token: adminToken,
    body: {
      salaryType: 'MONTHLY',
      salaryAmount: 350,
      userId,
    },
  });

  const secondAmount = Number(secondSalaryRes.data?.salaryAmount);
  log(
    'POST salary second time → upsert (not 400)',
    (secondSalaryRes.status === 200 || secondSalaryRes.status === 201) &&
      secondSalaryRes.status !== 400 &&
      secondAmount === 350,
    `status=${secondSalaryRes.status}, amount=${secondSalaryRes.data?.salaryAmount}`,
  );

  log(
    'Second POST updates same salary record',
    firstOk &&
      secondSalaryRes.data?.id != null &&
      secondSalaryRes.data.id === firstSalaryRes.data.id,
    `firstId=${firstSalaryRes.data?.id}, secondId=${secondSalaryRes.data?.id}`,
  );

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);

  if (failed.length) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
