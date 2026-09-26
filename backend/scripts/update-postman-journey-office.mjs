import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const collectionPath = path.join(__dirname, '..', 'red-sea.postman.json');

const collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));

function authHeader(tokenVar = 'token') {
  return [
    { key: 'Authorization', value: `Bearer {{${tokenVar}}}`, type: 'string' },
  ];
}

function employeeAuthHeader() {
  return authHeader('employeeToken');
}

function adminAuthHeader() {
  return authHeader('adminToken');
}

function jsonHeader(tokenVar = 'token') {
  return [
    ...authHeader(tokenVar),
    { key: 'Content-Type', value: 'application/json', type: 'string' },
  ];
}

function makeUrl(raw, pathSegments, query = []) {
  return {
    raw,
    path: ['api', ...pathSegments],
    host: ['{{baseUrl}}'],
    query,
    variable: [],
  };
}

function makeRequest({ method, url, body, description, headers, tokenVar }) {
  const req = {
    auth: {},
    method,
    header: headers ?? (method === 'GET' || method === 'DELETE' ? authHeader(tokenVar) : jsonHeader(tokenVar)),
    url,
    body: body ?? {},
  };
  return {
    name: '',
    description: description ?? '',
    event: [],
    auth: {},
    request: req,
    response: [],
    protocolProfileBehavior: { strictSSL: false, followRedirects: true },
  };
}

function paginateQuery(extra = []) {
  return [
    { key: 'page', value: '1', description: 'Page number', type: 'string' },
    { key: 'pageSize', value: '10', description: 'Items per page', type: 'string' },
    { key: 'sortField', value: 'id', description: 'Field to sort by', type: 'string' },
    { key: 'sortOrder', value: 'DESC', description: 'ASC or DESC', type: 'string' },
    ...extra,
  ];
}

function findFolder(items, name) {
  for (const item of items) {
    if (item.name === name && item.item) return item;
    if (item.item) {
      const found = findFolder(item.item, name);
      if (found) return found;
    }
  }
  return null;
}

function upsertItem(folder, name, newItem) {
  folder.item = folder.item.filter(i => i.name !== '');
  const idx = folder.item.findIndex(i => i.name === name);
  const item = { ...newItem, name };
  if (idx >= 0) folder.item[idx] = { ...folder.item[idx], ...item, name };
  else folder.item.push(item);
}

const journey = findFolder(collection.item, 'Journey');
if (!journey) throw new Error('Journey folder not found');

// --- Update Get All with search filters ---
upsertItem(journey, 'Get All', makeRequest({
  method: 'GET',
  description: 'Paginated journeys with search across delegate number, driver, client, policy, delivery area/gov',
  url: makeUrl(
    '{{baseUrl}}/api/journeys?page=1&pageSize=10&sortField=id&sortOrder=DESC&search=',
    ['journeys'],
    paginateQuery([
      { key: 'search', value: '', description: 'Global search (OR across journey + relations)', type: 'string', disabled: true },
      { key: 'tripStatus', value: 'NOTSTATED', description: 'NOTSTATED | ONROAD | COMPLETED | CANCELLED', type: 'string', disabled: true },
      { key: 'createdAtFrom', value: '2024-01-01', type: 'string', disabled: true },
      { key: 'createdAtTo', value: '2026-12-31', type: 'string', disabled: true },
    ]),
  ),
}));

const companyCarBody = JSON.stringify(
  {
    vehicleMode: 'COMPANY_CAR',
    clientId: 1,
    direction: 'Cairo',
    packingType: 'BAGGED',
    cementGrade: '42.5',
    quantity: 120,
    custodyAmount: 5000,
    driverAssistantId: 4,
    driverId: 1,
    carId: 1,
    trailerId: 1,
    receivedCompany: 'ACME',
    sellingOrderNo: 'SO-001',
  },
  null,
  2,
);

const contractCarBody = JSON.stringify(
  {
    vehicleMode: 'CONTRACT_CAR',
    clientId: 1,
    direction: 'Alexandria',
    packingType: 'BAGGED',
    quantity: 80,
    driverId: 1,
    carId: 2,
    trailerId: 2,
    receivedCompany: 'Factory Co',
    sellingOrderNo: 'SO-002',
  },
  null,
  2,
);

const nolonSelectBody = JSON.stringify(
  {
    vehicleMode: 'NOLON_CAR',
    clientId: 1,
    direction: 'Giza',
    packingType: 'BAGGED',
    quantity: 50,
    custodyAmount: 3000,
    driverId: 1,
    carId: 3,
    trailerId: 1,
    receivedCompany: 'Rental Client',
    sellingOrderNo: 'SO-003',
  },
  null,
  2,
);

const flatIdsNote =
  'Use top-level driverId, carId, trailerId (car/trailer ownerShip must match vehicleMode).';

const officeUrl = makeUrl('{{baseUrl}}/api/journeys/office', ['journeys', 'office']);

const saveJourneyIdEvent = {
  listen: 'test',
  script: {
    exec: [
      'if (pm.response.code === 201) {',
      '  const body = pm.response.json();',
      '  if (body?.id) pm.collectionVariables.set("journeyId", String(body.id));',
      '}',
    ],
    type: 'text/javascript',
    packages: {},
  },
};

function officeCreateRequest(name, description, bodyObj) {
  return {
    ...makeRequest({
      method: 'POST',
      description,
      url: officeUrl,
      body: {
        mode: 'raw',
        raw: JSON.stringify(bodyObj, null, 2),
        options: { raw: { language: 'json' } },
      },
    }),
    name,
    event: [saveJourneyIdEvent],
  };
}

const companyCarNoCustodyBody = {
  vehicleMode: 'COMPANY_CAR',
  clientId: 1,
  direction: 'Cairo',
  packingType: 'BAGGED',
  cementGrade: '42.5',
  quantity: 120,
  driverId: 1,
  carId: 1,
  trailerId: 1,
  receivedCompany: 'ACME',
  sellingOrderNo: 'SO-001-NC',
};

const nolonNestedBody = {
  vehicleMode: 'NOLON_CAR',
  clientId: 1,
  direction: 'Giza',
  packingType: 'BAGGED',
  quantity: 50,
  driver: { id: 1 },
  car: { id: 3 },
  trailer: { id: 1 },
  receivedCompany: 'Rental Client',
  sellingOrderNo: 'SO-003-NESTED',
};

const nolonInlineCreateBody = {
  vehicleMode: 'NOLON_CAR',
  clientId: 1,
  direction: 'Giza',
  packingType: 'BAGGED',
  quantity: 50,
  custodyAmount: 3000,
  driver: {
    user: {
      firstName: 'Nolon',
      lastName: 'Driver',
      nationalId: 2,
      phoneNumber: '51515',
    },
  },
  car: {
    plateNumber: '9901',
    plateLetters: 'ن ل ن',
    licenseNumber: 'LIC-NOLON-CAR-001',
    licenseExpiryDate: '2027-01-01',
  },
  trailer: {
    maxWeight: 25000,
    plateNumber: '9902',
    plateLetters: 'م ق ط',
  },
  receivedCompany: 'Rental Client',
  sellingOrderNo: 'SO-003-INLINE',
};

const officeCreateFolder = {
  name: 'Create (Office)',
  description:
    'POST /api/journeys/office — requires EMPLOYEE JWT.\n\n' +
    'vehicleMode must match car/trailer ownerShip:\n' +
    '• COMPANY_CAR → ownerShip COMPANY_CAR\n' +
    '• CONTRACT_CAR → ownerShip CONTRACT_CAR\n' +
    '• NOLON_CAR → ownerShip NOLON_CAR (inline create allowed)\n\n' +
    'Required: vehicleMode, clientId. NOLON inline: driver/car/trailer objects directly (no create wrapper). phoneNumber → Contact entity.',
  item: [
    {
      ...makeRequest({
        method: 'GET',
        description:
          'EMPLOYEE token — available custody for logged-in office user.\n' +
          'ADMIN token — add ?employeeId={{officeEmployeeId}}',
        url: makeUrl('{{baseUrl}}/api/journeys/office/custody-amount', ['journeys', 'office', 'custody-amount'], [
          { key: 'employeeId', value: '{{officeEmployeeId}}', description: 'ADMIN only', disabled: true },
        ]),
      }),
      name: 'Get Office Custody Amount',
    },
    officeCreateRequest(
      'COMPANY_CAR — flat ids + custody',
      `Company fleet (OWN). ${flatIdsNote} Creates custody tx when custodyAmount > 0.`,
      JSON.parse(companyCarBody),
    ),
    officeCreateRequest(
      'COMPANY_CAR — flat ids, no custody',
      `Same as company mode without custodyAmount (no custody record). ${flatIdsNote}`,
      companyCarNoCustodyBody,
    ),
    officeCreateRequest(
      'CONTRACT_CAR — flat ids',
      `Contract/factory fleet. carId/trailerId must have ownerShip CONTRACT_CAR. ${flatIdsNote}`,
      JSON.parse(contractCarBody),
    ),
    officeCreateRequest(
      'NOLON_CAR — flat ids (select existing)',
      'Rental mode: select existing NOLON_CAR assets by id.',
      JSON.parse(nolonSelectBody),
    ),
    officeCreateRequest(
      'NOLON_CAR — nested ids (select existing)',
      'Alternative DTO shape: driver/car/trailer.id instead of flat ids.',
      nolonNestedBody,
    ),
    officeCreateRequest(
      'NOLON_CAR — inline create (unwrapped)',
      'Creates driver + car + trailer without create wrapper. user.phoneNumber → Contact; nationalId → personalId. Unique plates/licenses if re-run.',
      nolonInlineCreateBody,
    ),
  ],
  event: [
    { listen: 'prerequest', script: { exec: [], type: 'text/javascript', packages: {} } },
    { listen: 'test', script: { exec: [], type: 'text/javascript', packages: {} } },
  ],
  auth: {},
};

// Replace loose office-create requests with folder
const officeCreateNames = [
  'Create (Office) — Company Car',
  'Create (Office) — Contract Car',
  'Create (Office) — Nolon Car (select assets)',
];
journey.item = journey.item.filter(i => !officeCreateNames.includes(i.name));

const officeFolderIdx = journey.item.findIndex(i => i.name === 'Create (Office)');
if (officeFolderIdx >= 0) {
  journey.item[officeFolderIdx] = officeCreateFolder;
} else {
  const deleteIdx = journey.item.findIndex(i => i.name === 'Delete');
  if (deleteIdx >= 0) journey.item.splice(deleteIdx, 0, officeCreateFolder);
  else journey.item.push(officeCreateFolder);
}

journey.description =
  'Journeys API. Office create: use Create (Office) folder — EMPLOYEE auth, vehicleMode + matching ownerShip.';

// Rename/disable old Create pointing to POST /journeys
const oldCreateIdx = journey.item.findIndex(
  i => i.name === 'Create' || i.name === 'Create (deprecated — use Create Office)',
);
if (oldCreateIdx >= 0) {
  journey.item[oldCreateIdx].name = 'Create (deprecated — use Create Office)';
  journey.item[oldCreateIdx].description =
    'Legacy POST /api/journeys — commented out in API. Use POST /api/journeys/office instead.';
  journey.item[oldCreateIdx].request.method = 'POST';
  journey.item[oldCreateIdx].request.url = makeUrl('{{baseUrl}}/api/journeys/office', ['journeys', 'office']);
  journey.item[oldCreateIdx].request.body = {
    mode: 'raw',
    raw: companyCarBody,
    options: { raw: { language: 'json' } },
  };
}

const updateVehicleBody = JSON.stringify(
  {
    vehicleMode: 'COMPANY_CAR',
    carId: 2,
    trailerId: 2,
  },
  null,
  2,
);

upsertItem(journey, 'Update', makeRequest({
  method: 'PUT',
  description: `Update journey. When changing assets include vehicleMode and driverId/carId/trailerId. ${flatIdsNote}`,
  url: makeUrl('{{baseUrl}}/api/journeys/{{journeyId}}', ['journeys', '{{journeyId}}']),
  body: {
    mode: 'raw',
    raw: updateVehicleBody,
    options: { raw: { language: 'json' } },
  },
}));

// Journey Attachments — add Get All
const journeyAttachments = findFolder(collection.item, 'Journey Attachments');
if (journeyAttachments) {
  upsertItem(journeyAttachments, 'Get All', makeRequest({
    method: 'GET',
    description: 'List attachments with search, journeyId, type filters',
    url: makeUrl('{{baseUrl}}/api/journey-attachments', ['journey-attachments'], paginateQuery([
      { key: 'search', value: '', description: 'Search url field', type: 'string', disabled: true },
      { key: 'journeyId', value: '1', type: 'string', disabled: true },
      { key: 'type', value: 'POLICY', description: 'RECEIPT | RECEIPT_POLICY | SHIPPING_POLICY | DELEGATE | POLICY', type: 'string', disabled: true },
    ])),
  }));
}

// Journey Policy — add search on Get All if exists
const journeyPolicy = findFolder(collection.item, 'Journey Policy');
if (journeyPolicy) {
  const getAllPolicy = journeyPolicy.item.find(i => i.name === 'Get All');
  if (getAllPolicy?.request?.url) {
    getAllPolicy.description = 'List policies with ?search= across policy + journey + delivery gov/area';
    getAllPolicy.request.url.query = paginateQuery([
      { key: 'search', value: '', type: 'string', disabled: true },
    ]);
  }
}

// Journey Transaction — add search query on first GET if present
const journeyTx = findFolder(collection.item, 'journey-transaction');
if (journeyTx) {
  const listTx = journeyTx.item.find(i => i.name === 'Get All' || i.request?.method === 'GET');
  if (listTx?.request?.url) {
    listTx.description = 'List transactions; ?search= across transaction + journey fields';
    const q = listTx.request.url.query ?? [];
    if (!q.some(x => x.key === 'search')) {
      listTx.request.url.query = [
        ...paginateQuery(),
        { key: 'journeyId', value: '1', type: 'string', disabled: true },
        { key: 'transactionType', value: 'EXPENSE', type: 'string', disabled: true },
        { key: 'category', value: 'Diesel Fees', type: 'string', disabled: true },
        { key: 'search', value: '', type: 'string', disabled: true },
      ];
    }
  }
}

// --- Office Requests folder ---
const saveOfficeRequestIdEvent = {
  listen: 'test',
  script: {
    exec: [
      'if (pm.response.code === 201) {',
      '  const body = pm.response.json();',
      '  if (body?.id) pm.collectionVariables.set("officeRequestId", String(body.id));',
      '}',
    ],
    type: 'text/javascript',
    packages: {},
  },
};

function officeRequestCreateItem(name, description, bodyObj) {
  return {
    ...makeRequest({
      method: 'POST',
      description,
      tokenVar: 'employeeToken',
      url: makeUrl('{{baseUrl}}/api/office-requests', ['office-requests']),
      body: {
        mode: 'raw',
        raw: JSON.stringify(bodyObj, null, 2),
        options: { raw: { language: 'json' } },
      },
    }),
    name,
    event: [
      saveOfficeRequestIdEvent,
      {
        listen: 'test',
        script: {
          exec: [
            'pm.test("Created (201)", () => pm.response.to.have.status(201));',
            'pm.test("Status is PENDING", () => pm.response.json().status === "PENDING");',
          ],
          type: 'text/javascript',
          packages: {},
        },
      },
    ],
  };
}

function officeRequestActionItem(name, description, bodyObj, createBody) {
  const prerequest = createBody
    ? {
        listen: 'prerequest',
        script: {
          exec: [
            'const baseUrl = pm.variables.get("baseUrl");',
            'const token = pm.variables.get("employeeToken");',
            `const body = ${JSON.stringify(createBody)};`,
            'pm.sendRequest({',
            '  url: `${baseUrl}/api/office-requests`,',
            '  method: "POST",',
            '  header: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },',
            '  body: { mode: "raw", raw: JSON.stringify(body) },',
            '}, (err, res) => {',
            '  if (err || res.code !== 201) return;',
            '  const id = res.json().id;',
            '  if (id) pm.variables.set("officeRequestId", String(id));',
            '});',
          ],
          type: 'text/javascript',
          packages: {},
        },
      }
    : null;

  return {
    ...makeRequest({
      method: 'POST',
      description,
      tokenVar: 'adminToken',
      url: makeUrl('{{baseUrl}}/api/office-requests/{{officeRequestId}}/request-action', [
        'office-requests',
        '{{officeRequestId}}',
        'request-action',
      ]),
      body: {
        mode: 'raw',
        raw: JSON.stringify(bodyObj, null, 2),
        options: { raw: { language: 'json' } },
      },
    }),
    name,
    event: [
      ...(prerequest ? [prerequest] : []),
      {
        listen: 'test',
        script: {
          exec: [
            'pm.test("Action applied", () => pm.expect(pm.response.code).to.be.oneOf([200, 201]));',
          ],
          type: 'text/javascript',
          packages: {},
        },
      },
    ],
  };
}

const officeRequestCreateFolder = {
  name: 'Create',
  description:
    'POST /api/office-requests — use EMPLOYEE JWT.\n\n' +
    'requestedFromId and requestedToId are auto-resolved (from JWT + admin employee).\n' +
    'journeyId is required only for PRINT_DELEGATION. END_WORKING_SHIFT and ASK_FOR_CUSTODY omit journeyId.',
  item: [
    officeRequestCreateItem(
      'PRINT_DELEGATION',
      'Request admin to print delegation document for a journey.',
      {
        type: 'PRINT_DELEGATION',
        journeyId: 1,
      },
    ),
    officeRequestCreateItem(
      'END_WORKING_SHIFT',
      'Request to end working shift — optional note. On approve admin moves custody.',
      {
        type: 'END_WORKING_SHIFT',
        note: 'Request to end working shift',
      },
    ),
    officeRequestCreateItem(
      'ASK_FOR_CUSTODY',
      'Request custody advance — amount required. On approve admin moves funds.',
      {
        type: 'ASK_FOR_CUSTODY',
        amount: 5000,
      },
    ),
  ],
  event: [
    { listen: 'prerequest', script: { exec: [], type: 'text/javascript', packages: {} } },
    { listen: 'test', script: { exec: [], type: 'text/javascript', packages: {} } },
  ],
  auth: {},
};

const officeRequestActionFolder = {
  name: 'Request Action',
  description:
    'POST /api/office-requests/:id/request-action — ADMIN JWT only.\n\n' +
    'PRINT_DELEGATION: approve sets status only.\n' +
    'END_WORKING_SHIFT: approve + custody transfer from requester.\n' +
    'ASK_FOR_CUSTODY: approve + custody transfer to requester.',
  item: [
    officeRequestActionItem(
      'Reject',
      'Reject any pending request — no custody side effects.',
      { status: 'REJECTED' },
      { type: 'END_WORKING_SHIFT', note: 'Reject test' },
    ),
    officeRequestActionItem(
      'Approve — PRINT_DELEGATION',
      'Approve print delegation — resets delegation print state.',
      { status: 'APPROVED' },
      { type: 'PRINT_DELEGATION', journeyId: 1 },
    ),
    officeRequestActionItem(
      'Approve — END_WORKING_SHIFT → Treasury',
      'Return requester custody balance to الخزينة (الخزينه account).',
      {
        status: 'APPROVED',
        custody: { amount: 100, transferTo: 'TREASURY' },
      },
      { type: 'END_WORKING_SHIFT', note: 'End shift treasury' },
    ),
    officeRequestActionItem(
      'Approve — END_WORKING_SHIFT → Employee',
      'Hand requester custody balance to another employee.',
      {
        status: 'APPROVED',
        custody: {
          amount: 100,
          transferTo: 'EMPLOYEE',
          targetEmployeeId: 3,
        },
      },
      { type: 'END_WORKING_SHIFT', note: 'End shift to employee' },
    ),
    officeRequestActionItem(
      'Approve — ASK_FOR_CUSTODY ← Treasury',
      'Disburse custody from treasury to requester.',
      {
        status: 'APPROVED',
        custody: { amount: 100, transferFrom: 'TREASURY' },
      },
      { type: 'ASK_FOR_CUSTODY', amount: 100 },
    ),
    officeRequestActionItem(
      'Approve — ASK_FOR_CUSTODY ← Employee',
      'Transfer custody from another employee to requester.',
      {
        status: 'APPROVED',
        custody: {
          amount: 100,
          transferFrom: 'EMPLOYEE',
          sourceEmployeeId: 3,
        },
      },
      { type: 'ASK_FOR_CUSTODY', amount: 100 },
    ),
  ],
  event: [
    { listen: 'prerequest', script: { exec: [], type: 'text/javascript', packages: {} } },
    { listen: 'test', script: { exec: [], type: 'text/javascript', packages: {} } },
  ],
  auth: {},
};

const officeRequestItems = [
  {
    ...makeRequest({
      method: 'GET',
      description: 'List office requests with filters and search',
      url: makeUrl('{{baseUrl}}/api/office-requests', ['office-requests'], paginateQuery([
        { key: 'search', value: '', type: 'string', disabled: true },
        { key: 'status', value: 'PENDING', description: 'PENDING | APPROVED | REJECTED', type: 'string', disabled: true },
        { key: 'type', value: 'PRINT_DELEGATION', description: 'PRINT_DELEGATION | END_WORKING_SHIFT | ASK_FOR_CUSTODY', type: 'string', disabled: true },
        { key: 'journeyId', value: '{{journeyId}}', type: 'string', disabled: true },
        { key: 'requestedFromId', value: '{{officeEmployeeId}}', type: 'string', disabled: true },
        { key: 'requestedToId', value: '{{adminEmployeeId}}', type: 'string', disabled: true },
      ])),
    }),
    name: 'Get All',
  },
  {
    ...makeRequest({
      method: 'GET',
      description: 'Get office request by id',
      url: makeUrl('{{baseUrl}}/api/office-requests/{{officeRequestId}}', ['office-requests', '{{officeRequestId}}']),
    }),
    name: 'Get One',
  },
  officeRequestCreateFolder,
  officeRequestActionFolder,
  {
    ...makeRequest({
      method: 'DELETE',
      description: 'ADMIN only — delete office request',
      url: makeUrl('{{baseUrl}}/api/office-requests/{{officeRequestId}}', ['office-requests', '{{officeRequestId}}']),
    }),
    name: 'Delete',
  },
];

// Insert Office Requests after Journey folder in root item array
const journeyIdx = collection.item.findIndex(i => i.name === 'Journey');
const officeFolder = {
  name: 'Office Requests',
  description:
    'Office workflow requests linked to journeys and employees.\n\n' +
    'Flow: Journey → Create (Office) sets journeyId for PRINT_DELEGATION only → Create (EMPLOYEE token) → Request Action (ADMIN token).\n' +
    'Types: PRINT_DELEGATION (requires journeyId) | END_WORKING_SHIFT | ASK_FOR_CUSTODY',
  item: officeRequestItems,
  event: [
    { listen: 'prerequest', script: { exec: [], type: 'text/javascript', packages: {} } },
    { listen: 'test', script: { exec: [], type: 'text/javascript', packages: {} } },
  ],
  auth: {},
};

const existingOffice = collection.item.findIndex(i => i.name === 'Office Requests');
if (existingOffice >= 0) {
  collection.item[existingOffice] = officeFolder;
} else if (journeyIdx >= 0) {
  collection.item.splice(journeyIdx + 1, 0, officeFolder);
} else {
  collection.item.push(officeFolder);
}

const journeyDelegationPrintFolder = {
  name: 'Journey Delegation Print',
  description:
    'Track whether a journey delegation document needs printing.\n\n' +
    'Auto-created NOT_PRINTED on POST /api/journeys/office.\n' +
    'GET returns canPrint; POST mark-printed sets PRINTED.\n' +
    'Approving PRINT_DELEGATION office request resets to NOT_PRINTED.',
  item: [
    {
      ...makeRequest({
        method: 'GET',
        description: 'Get print state for journey — canPrint true when NOT_PRINTED',
        tokenVar: 'adminToken',
        url: makeUrl('{{baseUrl}}/api/journey-delegation-prints/{{journeyId}}', [
          'journey-delegation-prints',
          '{{journeyId}}',
        ]),
      }),
      name: 'Get By Journey Id',
      event: [
        {
          listen: 'test',
          script: {
            exec: [
              'pm.test("OK", () => pm.expect(pm.response.code).to.be.oneOf([200, 201]));',
              'pm.test("Has canPrint", () => pm.response.json().canPrint !== undefined);',
            ],
            type: 'text/javascript',
            packages: {},
          },
        },
      ],
    },
    {
      ...makeRequest({
        method: 'POST',
        description: 'Mark delegation as physically printed (EMPLOYEE token)',
        tokenVar: 'employeeToken',
        url: makeUrl('{{baseUrl}}/api/journey-delegation-prints/{{journeyId}}/mark-printed', [
          'journey-delegation-prints',
          '{{journeyId}}',
          'mark-printed',
        ]),
      }),
      name: 'Mark Printed',
      event: [
        {
          listen: 'test',
          script: {
            exec: [
              'pm.test("OK", () => pm.expect(pm.response.code).to.be.oneOf([200, 201]));',
            ],
            type: 'text/javascript',
            packages: {},
          },
        },
      ],
    },
  ],
  event: [
    { listen: 'prerequest', script: { exec: [], type: 'text/javascript', packages: {} } },
    { listen: 'test', script: { exec: [], type: 'text/javascript', packages: {} } },
  ],
  auth: {},
};

const existingDelegationPrint = collection.item.findIndex(i => i.name === 'Journey Delegation Print');
const officeIdxForDelegation = collection.item.findIndex(i => i.name === 'Office Requests');
if (existingDelegationPrint >= 0) {
  collection.item[existingDelegationPrint] = journeyDelegationPrintFolder;
} else if (officeIdxForDelegation >= 0) {
  collection.item.splice(officeIdxForDelegation + 1, 0, journeyDelegationPrintFolder);
} else if (journeyIdx >= 0) {
  collection.item.splice(journeyIdx + 1, 0, journeyDelegationPrintFolder);
} else {
  collection.item.push(journeyDelegationPrintFolder);
}

/** Remove outdated duplicate outside Journey → Create (Office). */
function removeLegacyOfficeEmployeeDuplicates(items) {
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    if (item.item) removeLegacyOfficeEmployeeDuplicates(item.item);
    if (item.name === 'Create (Office - Employee)') {
      items.splice(i, 1);
    }
  }
}
removeLegacyOfficeEmployeeDuplicates(collection.item);

// --- Auth folder: admin + employee login ---
const saveTokenScript = (varName) => ({
  listen: 'test',
  script: {
    exec: [
      'pm.test("Login OK", () => pm.expect(pm.response.code).to.be.oneOf([200, 201]));',
      'const body = pm.response.json();',
      `if (body?.token) pm.collectionVariables.set("${varName}", body.token);`,
      varName === 'adminToken' ? 'if (body?.token) pm.collectionVariables.set("token", body.token);' : '',
    ].filter(Boolean),
    type: 'text/javascript',
    packages: {},
  },
});

const authFolder = collection.item.find((i) => i.name === 'auth');
if (authFolder?.item) {
  const upsertLogin = (name, email, varName) => {
    const item = {
      name,
      description: `Login and set {{${varName}}}`,
      event: [saveTokenScript(varName)],
      auth: {},
      request: {
        auth: {},
        method: 'POST',
        header: [{ key: 'Content-Type', value: 'application/json', type: 'string' }],
        url: makeUrl('{{baseUrl}}/api/auth/login', ['auth', 'login']),
        body: {
          mode: 'raw',
          raw: JSON.stringify({ email, password: '12345' }, null, 2),
          options: { raw: { language: 'json' } },
        },
      },
      response: [],
      protocolProfileBehavior: { strictSSL: false, followRedirects: true },
    };
    const idx = authFolder.item.findIndex((i) => i.name === name);
    if (idx >= 0) authFolder.item[idx] = item;
    else authFolder.item.push(item);
  };
  upsertLogin('Login Admin', 'admin@admin.com', 'adminToken');
  upsertLogin('Login Employee', 'office1@test.com', 'employeeToken');
}

const collectionVars = [
  { key: 'baseUrl', value: 'http://localhost:8080', type: 'string' },
  { key: 'journeyId', value: '1', type: 'string' },
  { key: 'officeRequestId', value: '1', type: 'string' },
  { key: 'driverId', value: '1', type: 'string' },
  { key: 'carId', value: '1', type: 'string' },
  { key: 'trailerId', value: '1', type: 'string' },
  { key: 'adminEmployeeId', value: '1', type: 'string' },
  { key: 'officeEmployeeId', value: '2', type: 'string' },
  { key: 'otherEmployeeId', value: '3', type: 'string' },
  { key: 'custodyAmount', value: '5000', type: 'string' },
  { key: 'adminToken', value: '', type: 'string' },
  { key: 'employeeToken', value: '', type: 'string' },
  { key: 'token', value: '', type: 'string' },
];
for (const v of collectionVars) {
  const existing = collection.variable.find(x => x.key === v.key);
  if (existing) Object.assign(existing, v);
  else collection.variable.push(v);
}

fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 4), 'utf8');
console.log('Updated red-sea.postman.json — Journey, Office Requests, Journey Delegation Print');
