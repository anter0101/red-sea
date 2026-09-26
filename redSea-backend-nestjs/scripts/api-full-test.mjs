/**
 * Run full Postman collection; report 500 responses.
 * Usage: node scripts/api-full-test.mjs
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE_URL || 'http://localhost:8080';
const collectionPath = path.join(__dirname, '..', 'red-sea.postman.json');
const envPath = path.join(__dirname, '..', 'postman', 'Red-Sea.local.postman_environment.json');
const reportPath = path.join(__dirname, '..', 'postman', '.newman-report.json');

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

async function main() {
  console.log(`Full API test → ${BASE}\n`);
  const adminToken = await login('admin@admin.com', '12345');
  let employeeToken;
  try {
    employeeToken = await login('office1@test.com', '12345');
  } catch {
    employeeToken = adminToken;
  }

  const journeys = await fetch(
    `${BASE}/api/journeys?page=1&pageSize=1&sortField=id&sortOrder=DESC`,
    { headers: { Authorization: `Bearer ${adminToken}` } },
  ).then((r) => r.json());
  const journeyId = String(journeys?.[0]?.id ?? 1);

  const env = JSON.parse(fs.readFileSync(envPath, 'utf8'));
  const set = (key, value) => {
    const i = env.values.findIndex((v) => v.key === key);
    if (i >= 0) env.values[i] = { ...env.values[i], value };
    else env.values.push({ key, value, type: 'default', enabled: true });
  };
  set('baseUrl', BASE);
  set('token', adminToken);
  set('adminToken', adminToken);
  set('employeeToken', employeeToken);
  set('journeyId', journeyId);

  const tmpEnv = path.join(__dirname, '..', 'postman', '.newman-runtime.postman_environment.json');
  fs.writeFileSync(tmpEnv, JSON.stringify(env, null, 2));

  try {
    fs.unlinkSync(reportPath);
  } catch {
    /* ignore */
  }

  try {
    execSync(
      `npx --yes newman run "${collectionPath}" -e "${tmpEnv}" --delay-request 200 --reporters cli,json --reporter-json-export "${reportPath}" --env-var "baseUrl=${BASE}" --env-var "adminToken=${adminToken}" --env-var "employeeToken=${employeeToken}" --env-var "token=${adminToken}" --env-var "journeyId=${journeyId}" --color off`,
      { stdio: 'inherit', cwd: path.join(__dirname, '..') },
    );
  } catch {
  }

  if (!fs.existsSync(reportPath)) {
    console.error('No Newman report generated');
    process.exit(1);
  }

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const executions = report.run?.executions ?? [];
  const errors500 = [];
  const otherFailures = [];

  for (const ex of executions) {
    const name = ex.item?.name ?? '?';
    const method = ex.request?.method ?? '?';
    const url = ex.request?.url?.toString?.() ?? ex.request?.url?.raw ?? '?';
    const code = ex.response?.code;
    const body = ex.response?.stream?.toString?.() ?? '';
    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      parsed = body.slice(0, 200);
    }

    if (code === 500) {
      errors500.push({ name, method, url, message: parsed?.message ?? parsed });
    } else if (ex.assertions?.some((a) => a.error)) {
      const failedAssert = ex.assertions.find((a) => a.error);
      if (code && code >= 400) {
        otherFailures.push({ name, method, url, code, assert: failedAssert?.error?.message });
      }
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Requests: ${executions.length}`);
  console.log(`500 errors: ${errors500.length}`);

  if (errors500.length) {
    console.log('\n=== 500 ERRORS ===');
    for (const e of errors500) {
      console.log(`${e.method} ${e.url}`);
      console.log(`  ${e.name}: ${JSON.stringify(e.message)}`);
    }
  }

  const byCode = {};
  for (const ex of executions) {
    const c = ex.response?.code ?? 'none';
    byCode[c] = (byCode[c] || 0) + 1;
  }
  console.log('\nStatus distribution:', byCode);

  process.exit(errors500.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
