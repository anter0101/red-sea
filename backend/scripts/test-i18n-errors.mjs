/**
 * Verify API error responses are Arabic by default (no Accept-Language).
 * Pass Accept-Language: en-US to get English.
 * Run: node scripts/test-i18n-errors.mjs
 */
const BASE = process.env.BASE_URL || 'http://localhost:8080';

const ARABIC_RE = /[\u0600-\u06FF]/;

function hasArabic(value) {
  const text = Array.isArray(value) ? value.join(' ') : String(value ?? '');
  return ARABIC_RE.test(text);
}

async function request(method, path, { token, body, acceptLanguage } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (acceptLanguage !== undefined) {
    headers['Accept-Language'] = acceptLanguage;
  }

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

async function main() {
  const results = [];
  const log = (name, ok, detail = '') => {
    results.push({ name, ok, detail });
    console.log(`${ok ? 'PASS' : 'FAIL'} — ${name}${detail ? `: ${detail}` : ''}`);
  };

  console.log(`Testing i18n error responses against ${BASE}\n`);

  const adminToken = await login('admin@admin.com', '12345');

  let employeeToken;
  try {
    employeeToken = await login('office1@test.com', '12345');
  } catch {
    employeeToken = adminToken;
  }

  // 1. Auth — invalid credentials (default Arabic)
  {
    const res = await request('POST', '/api/auth/login', {
      body: { email: 'admin@admin.com', password: 'wrong' },
    });
    log(
      'Auth invalid login → Arabic (default)',
      res.status === 401 &&
        hasArabic(res.data?.message) &&
        res.data?.message.includes('البريد') &&
        res.data?.error === 'غير مصرح',
      JSON.stringify({ message: res.data?.message, error: res.data?.error }),
    );
  }

  // 2. Auth — English override
  {
    const res = await request('POST', '/api/auth/login', {
      body: { email: 'admin@admin.com', password: 'wrong' },
      acceptLanguage: 'en-US',
    });
    log(
      'Auth invalid login → English (Accept-Language: en)',
      res.status === 401 &&
        res.data?.message === 'Invalid login email or password!' &&
        res.data?.error === 'Unauthorized',
      JSON.stringify(res.data),
    );
  }

  // 3. Validation — bad journey DTO (default Arabic, EMPLOYEE endpoint)
  {
    const res = await request('POST', '/api/journeys/office', {
      token: employeeToken,
      body: { vehicleMode: 'INVALID' },
    });
    const msg = res.data?.message;
    log(
      'Journey validation → Arabic (default)',
      res.status === 400 && hasArabic(msg),
      Array.isArray(msg) ? msg[0] : msg,
    );
  }

  // 4. Not found — journey (default Arabic)
  {
    const res = await request('GET', '/api/journeys/999999999', { token: adminToken });
    log(
      'Journey not found → Arabic (default)',
      res.status === 404 &&
        hasArabic(res.data?.message) &&
        res.data?.error === 'غير موجود',
      res.data?.message,
    );
  }

  // 5. Office request — approve already approved (default Arabic)
  {
    const created = await request('POST', '/api/office-requests', {
      token: adminToken,
      body: {
        type: 'PRINT_DELEGATION',
        journeyId: 1,
        requestedFromId: 1,
        requestedToId: 1,
        description: 'i18n test',
      },
    });

    if (created.status === 201) {
      const id = created.data.id;
      await request('POST', `/api/office-requests/${id}/request-action`, {
        token: adminToken,
        body: { status: 'APPROVED' },
      });

      const second = await request('POST', `/api/office-requests/${id}/request-action`, {
        token: adminToken,
        body: { status: 'APPROVED' },
      });

      log(
        'Office request non-pending → Arabic (default)',
        second.status === 400 &&
          second.data?.message ===
            'يمكن التعامل مع الطلبات المعلقة فقط (الحالة الحالية: APPROVED)' &&
          second.data?.error === 'طلب غير صالح',
        second.data?.message,
      );
    } else {
      log('Office request non-pending → Arabic (default)', false, `setup failed: ${JSON.stringify(created.data)}`);
    }
  }

  // 6. Journey delegation print — already printed (default Arabic)
  {
    const journeys = await request(
      'GET',
      '/api/journeys?page=1&pageSize=5&sortField=id&sortOrder=DESC',
      { token: adminToken },
    );
    let journeyId = journeys.data?.[0]?.id;

    for (const j of journeys.data ?? []) {
      const probe = await request('GET', `/api/journey-delegation-prints/${j.id}`, {
        token: adminToken,
      });
      if (probe.status === 200) {
        journeyId = j.id;
        break;
      }
    }

    if (journeyId) {
      const state = await request('GET', `/api/journey-delegation-prints/${journeyId}`, {
        token: adminToken,
      });

      if (state.data?.status === 'NOT_PRINTED') {
        await request('POST', `/api/journey-delegation-prints/${journeyId}/mark-printed`, {
          token: employeeToken,
        });
      }

      const duplicate = await request(
        'POST',
        `/api/journey-delegation-prints/${journeyId}/mark-printed`,
        { token: employeeToken },
      );

      log(
        'Delegation already printed → Arabic (default)',
        duplicate.status === 400 &&
          duplicate.data?.message === 'تم وسم تفويض هذه الرحلة كمطبوع مسبقاً' &&
          duplicate.data?.error === 'طلب غير صالح',
        duplicate.data?.message,
      );
    } else {
      log('Delegation already printed → Arabic (default)', false, 'no journey with delegation record');
    }
  }

  // 7. Account not found (default Arabic)
  {
    const res = await request('GET', '/api/accounting/accounts/999999999', { token: adminToken });
    log(
      'Account not found → Arabic (default)',
      res.status === 404 && hasArabic(res.data?.message),
      res.data?.message,
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
