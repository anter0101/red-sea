/**
 * Run Postman collection smoke tests (Journey, Office Requests, Journey Delegation Print).
 * Usage: node scripts/run-newman-smoke.mjs
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE_URL || 'http://localhost:8080';
const collectionPath = path.join(__dirname, '..', 'red-sea.postman.json');
const envPath = path.join(__dirname, '..', 'postman', 'Red-Sea.local.postman_environment.json');

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

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name}. Set SMOKE_ADMIN_EMAIL, SMOKE_ADMIN_PASSWORD, SMOKE_EMPLOYEE_EMAIL, and SMOKE_EMPLOYEE_PASSWORD.`,
    );
  }
  return value;
}

async function main() {
  console.log(`Fetching tokens from ${BASE}...\n`);
  const adminToken = await login(requiredEnv('SMOKE_ADMIN_EMAIL'), requiredEnv('SMOKE_ADMIN_PASSWORD'));
  const employeeToken = await login(requiredEnv('SMOKE_EMPLOYEE_EMAIL'), requiredEnv('SMOKE_EMPLOYEE_PASSWORD'));

  const journeys = await fetch(`${BASE}/api/journeys?page=1&pageSize=1&sortField=id&sortOrder=DESC`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  }).then((r) => r.json());
  const journeyId = String(journeys?.[0]?.id ?? 1);

  const env = JSON.parse(fs.readFileSync(envPath, 'utf8'));
  env.values = env.values.map((v) => {
    if (v.key === 'baseUrl') return { ...v, value: BASE };
    if (v.key === 'token') return { ...v, value: adminToken };
    return v;
  });
  if (!env.values.find((v) => v.key === 'adminToken')) {
    env.values.push({ key: 'adminToken', value: adminToken, type: 'secret', enabled: true });
  } else {
    env.values = env.values.map((v) => (v.key === 'adminToken' ? { ...v, value: adminToken } : v));
  }
  if (!env.values.find((v) => v.key === 'employeeToken')) {
    env.values.push({ key: 'employeeToken', value: employeeToken, type: 'secret', enabled: true });
  } else {
    env.values = env.values.map((v) => (v.key === 'employeeToken' ? { ...v, value: employeeToken } : v));
  }
  if (!env.values.find((v) => v.key === 'journeyId')) {
    env.values.push({ key: 'journeyId', value: journeyId, type: 'default', enabled: true });
  } else {
    env.values = env.values.map((v) => (v.key === 'journeyId' ? { ...v, value: journeyId } : v));
  }

  const tmpEnv = path.join(__dirname, '..', 'postman', '.newman-runtime.postman_environment.json');
  fs.writeFileSync(tmpEnv, JSON.stringify(env, null, 2));

  const folders = ['auth', 'Office Requests', 'Journey Delegation Print'];
  let failed = 0;

  for (const folder of folders) {
    console.log(`\n=== Newman: ${folder} ===`);
    try {
      execSync(
        `npx --yes newman run "${collectionPath}" -e "${tmpEnv}" --folder "${folder}" --delay-request 800 --env-var "baseUrl=${BASE}" --env-var "adminToken=${adminToken}" --env-var "employeeToken=${employeeToken}" --env-var "token=${adminToken}" --env-var "journeyId=${journeyId}" --color off`,
        { stdio: 'inherit', cwd: path.join(__dirname, '..') },
      );
    } catch {
      failed += 1;
    }
  }

  console.log(failed ? `\nNewman smoke: ${failed} folder(s) had failures` : '\nNewman smoke: all folders passed');
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
