# Phase 6 — Frontend API Integration Guide

> **Base URL:** `http://localhost:<PORT>/api`
> **Auth:** All endpoints require `Authorization: Bearer <JWT>` header.
> **Pagination headers:** Every list endpoint returns `X-Total-Count`, `X-Page`, and `X-Has-Next` response headers.

---

## Table of Contents

1. [Custody Module](#1-custody-module)
2. [Office Request Module](#2-office-request-module)
3. [Journey Module — Phase 6 Additions](#3-journey-module--phase-6-additions)
   - [New: Office Create Journey (Employee flow)](#31-post-apijourneysofficecreate-employee)
   - [Updated: Create Journey (vehicleMode & inline assets)](#32-post-apijourneys-updated)
   - [Updated: Update Journey](#33-put-apijourneysidupdated)
   - [New: Get Journey Employees](#34-get-apijourneysidemployees)
   - [New: Get Journey Vehicles](#35-get-apijourneysidvehicles)
   - [New: Get Journey Info](#36-get-apijourneysidinfo)
   - [Updated: Get Journey Details (full)](#37-get-apijourneysiddetails)
4. [Shared Enums Reference](#4-shared-enums-reference)
5. [Flow Diagrams](#5-flow-diagrams)

---

## 1. Custody Module

**Base path:** `/api/custodies`
**Tag:** `custodies-module`

A **Custody** (عهدة) records that a financial account has been handed from an employee to a driver for a specific journey. It is created automatically when a journey is created via the `/api/journeys/office` endpoint, but can also be managed manually by ADMIN.

### Data Model

| Field        | Type            | Description                                         |
| ------------ | --------------- | --------------------------------------------------- |
| `id`         | `number`        | Auto-generated primary key                          |
| `employeeId` | `number`        | The employee holding the custody                    |
| `accountId`  | `number`        | The financial account linked                        |
| `status`     | `CustodyStatus` | `ACTIVE` / `INACTIVE` / `CLOSED` (default `ACTIVE`) |
| `journeyId`  | `number?`       | Optional linked journey                             |
| `driverId`   | `number?`       | Optional linked driver                              |
| `employee`   | `EmployeeDTO`   | Populated in GET responses                          |
| `account`    | `AccountDTO`    | Populated in GET responses                          |
| `journey`    | `JourneyDTO?`   | Populated in GET responses                          |
| `driver`     | `DriverDTO?`    | Populated in GET responses                          |
| `createdAt`  | `ISO string`    | Auto timestamp                                      |
| `updatedAt`  | `ISO string`    | Auto timestamp                                      |

---

### `GET /api/custodies`

**Roles:** `ADMIN`, `EMPLOYEE`
**Description:** Returns a paginated list of custodies. When the caller has the `EMPLOYEE` role, results are automatically filtered to only their own custodies — no extra filter needed.

#### Query Parameters

| Param           | Type            | Required | Description                    |
| --------------- | --------------- | -------- | ------------------------------ |
| `page`          | `number`        | No       | Page number (default: `1`)     |
| `pageSize`      | `number`        | No       | Items per page (default: `10`) |
| `sortField`     | `string`        | No       | Field name to sort by          |
| `sortOrder`     | `ASC` \| `DESC` | No       | Sort direction                 |
| `status`        | `CustodyStatus` | No       | Filter by status               |
| `employeeId`    | `number`        | No       | Filter by employee ID          |
| `accountId`     | `number`        | No       | Filter by account ID           |
| `journeyId`     | `number`        | No       | Filter by journey ID           |
| `driverId`      | `number`        | No       | Filter by driver ID            |
| `search`        | `string`        | No       | Full-text search               |
| `createdAtFrom` | `ISO date`      | No       | Date range filter start        |
| `createdAtTo`   | `ISO date`      | No       | Date range filter end          |
| `updatedAtFrom` | `ISO date`      | No       | Updated range filter start     |
| `updatedAtTo`   | `ISO date`      | No       | Updated range filter end       |

#### Response `200`

```json
[
  {
    "id": 1,
    "employeeId": 3,
    "accountId": 7,
    "journeyId": 12,
    "driverId": 5,
    "status": "ACTIVE",
    "employee": { "id": 3, "user": { "firstName": "Ahmed", "lastName": "Ali" } },
    "account": { "id": 7, "name": "Ahmed Ali" },
    "journey": { "id": 12, "delegateNumber": "DEL-001" },
    "driver": { "id": 5, "user": { "firstName": "Mahmoud", "lastName": "Hassan" } }
  }
]
```

---

### `GET /api/custodies/:id`

**Roles:** `ADMIN`
**Description:** Returns a single custody record with all relations populated.

#### Path Params

| Param | Type     | Description       |
| ----- | -------- | ----------------- |
| `id`  | `number` | Custody record ID |

#### Response `200` — full `CustodyDTO` with `employee`, `account`, `journey`, `driver` nested.

#### Errors

| Code | Condition                       |
| ---- | ------------------------------- |
| 404  | Custody with given id not found |

---

### `POST /api/custodies`

**Roles:** `ADMIN`
**Description:** Manually create a custody record. Only one custody may exist per `(employeeId, accountId)` combination.

#### Request Body

```json
{
  "employeeId": 3,
  "accountId": 7,
  "status": "ACTIVE",
  "journeyId": 12,
  "driverId": 5
}
```

| Field        | Type            | Required | Validation                                     |
| ------------ | --------------- | -------- | ---------------------------------------------- |
| `employeeId` | `number`        | **Yes**  | Must reference an existing employee            |
| `accountId`  | `number`        | **Yes**  | Must reference an existing account             |
| `status`     | `CustodyStatus` | No       | Default: `ACTIVE`                              |
| `journeyId`  | `number`        | No       | Must reference an existing journey if provided |
| `driverId`   | `number`        | No       | Must reference an existing driver if provided  |

#### Response `201` — partial `CustodyDTO` (id, ids, status fields)

#### Errors

| Code | Condition                                             |
| ---- | ----------------------------------------------------- |
| 400  | Employee not found                                    |
| 400  | Account not found                                     |
| 400  | Journey not found (if journeyId provided)             |
| 400  | Driver not found (if driverId provided)               |
| 400  | Custody already exists for this employee+account pair |

---

### `PUT /api/custodies/:id`

**Roles:** `ADMIN`
**Description:** Update an existing custody record. All fields are optional (partial update).

#### Path Params

| Param | Type     | Description |
| ----- | -------- | ----------- |
| `id`  | `number` | Custody ID  |

#### Request Body

```json
{
  "status": "CLOSED",
  "journeyId": 15
}
```

All fields from `CreateCustodyDTO` are optional here. Any foreign-key field (`employeeId`, `accountId`, `journeyId`, `driverId`) is validated for existence if provided.

#### Response `200` — updated custody DTO (id, ids, status)

#### Errors

| Code | Condition                                                     |
| ---- | ------------------------------------------------------------- |
| 404  | Custody not found                                             |
| 400  | Referenced entity (employee/account/journey/driver) not found |
| 400  | Duplicate custody for the resulting employee+account pair     |

---

### `DELETE /api/custodies/:id`

**Roles:** `ADMIN`
**Description:** Permanently deletes a custody record.

#### Response `200` — empty

#### Errors

| Code | Condition         |
| ---- | ----------------- |
| 404  | Custody not found |

---

---

## 2. Office Request Module

**Base path:** `/api/office-requests`
**Tag:** `office-requests-module`

An **Office Request** is a formal request from one employee to another, always scoped to a specific journey. The requesting employee creates it; an ADMIN then approves or rejects it.

### Data Model

| Field             | Type                  | Description                                     |
| ----------------- | --------------------- | ----------------------------------------------- |
| `id`              | `number`              | Auto-generated PK                               |
| `type`            | `OfficeRequestType`   | The kind of request                             |
| `status`          | `OfficeRequestStatus` | `PENDING` (default) / `APPROVED` / `REJECTED`   |
| `description`     | `string?`             | Optional free-text details                      |
| `journeyId`       | `number`              | ID of the linked journey (write-only on create) |
| `requestedFromId` | `number`              | Employee submitting the request (write-only)    |
| `requestedToId`   | `number`              | Employee receiving the request (write-only)     |
| `journey`         | `JourneyDTO`          | Populated in GET responses                      |
| `requestedFrom`   | `EmployeeDTO`         | Populated in GET responses (includes `.user`)   |
| `requestedTo`     | `EmployeeDTO`         | Populated in GET responses (includes `.user`)   |

### Request Types

| Value               | Description (Arabic) |
| ------------------- | -------------------- |
| `PRINT_DELEGATION`  | طباعة التفويض        |
| `END_WORKING_SHIFT` | إنهاء وردية العمل    |
| `ASK_FOR_CUSTODY`   | طلب عُهدة            |

### Status Lifecycle

```
PENDING  ──[ADMIN approves]──►  APPROVED
PENDING  ──[ADMIN rejects]───►  REJECTED

* Only PENDING requests can be acted on. APPROVED/REJECTED are terminal.
```

---

### `GET /api/office-requests`

**Roles:** `ADMIN`, `USER`
**Description:** Paginated list of office requests with optional filters.

#### Query Parameters

| Param             | Type                  | Required | Description                                                |
| ----------------- | --------------------- | -------- | ---------------------------------------------------------- |
| `page`            | `number`              | No       | Default: `1`                                               |
| `pageSize`        | `number`              | No       | Default: `10`                                              |
| `sortField`       | `string`              | No       | Sort field                                                 |
| `sortOrder`       | `ASC` \| `DESC`       | No       | Sort direction                                             |
| `journeyId`       | `number`              | No       | Filter by journey                                          |
| `requestedFromId` | `number`              | No       | Filter by requesting employee                              |
| `requestedToId`   | `number`              | No       | Filter by target employee                                  |
| `status`          | `OfficeRequestStatus` | No       | Filter by status                                           |
| `type`            | `OfficeRequestType`   | No       | Filter by type                                             |
| `search`          | `string`              | No       | Search across description, delegate number, employee names |
| `createdAtFrom`   | `ISO date`            | No       | Date range filter start                                    |
| `createdAtTo`     | `ISO date`            | No       | Date range filter end                                      |
| `updatedAtFrom`   | `ISO date`            | No       | Updated range filter start                                 |
| `updatedAtTo`     | `ISO date`            | No       | Updated range filter end                                   |

#### Response `200`

```json
[
  {
    "id": 1,
    "type": "PRINT_DELEGATION",
    "status": "PENDING",
    "description": "Please print the delegation for trip 12",
    "journey": { "id": 12, "delegateNumber": "DEL-001" },
    "requestedFrom": {
      "id": 3,
      "user": { "firstName": "Ahmed", "lastName": "Ali" }
    },
    "requestedTo": {
      "id": 5,
      "user": { "firstName": "Sara", "lastName": "Mohamed" }
    },
    "createdAt": "2026-06-10T09:00:00.000Z",
    "updatedAt": "2026-06-10T09:00:00.000Z"
  }
]
```

---

### `GET /api/office-requests/:id`

**Roles:** `ADMIN`, `USER`
**Description:** Returns a single office request with all relations populated.

#### Response `200` — full `OfficeRequestDTO`

#### Errors

| Code | Condition                       |
| ---- | ------------------------------- |
| 404  | Request with given id not found |

---

### `POST /api/office-requests`

**Roles:** `ADMIN`, `USER`
**Description:** Create a new office request. Status is automatically set to `PENDING`.

#### Request Body

```json
{
  "type": "PRINT_DELEGATION",
  "description": "Please print the delegation for trip 12",
  "journeyId": 12,
  "requestedFromId": 3,
  "requestedToId": 5
}
```

| Field             | Type                | Required | Validation                          |
| ----------------- | ------------------- | -------- | ----------------------------------- |
| `type`            | `OfficeRequestType` | **Yes**  | Must be a valid enum value          |
| `description`     | `string`            | No       | Free-text                           |
| `journeyId`       | `number`            | **Yes**  | Must reference an existing journey  |
| `requestedFromId` | `number`            | **Yes**  | Must reference an existing employee |
| `requestedToId`   | `number`            | **Yes**  | Must reference an existing employee |

#### Response `201` — full `OfficeRequestDTO` with all relations

#### Errors

| Code | Condition                          |
| ---- | ---------------------------------- |
| 404  | Journey not found                  |
| 404  | `requestedFrom` employee not found |
| 404  | `requestedTo` employee not found   |

---

### `POST /api/office-requests/:id/request-action`

**Roles:** `ADMIN` only
**Description:** Admin approves or rejects a PENDING office request. This is the only way to change the status — end users cannot change it themselves.

#### Path Params

| Param | Type     | Description       |
| ----- | -------- | ----------------- |
| `id`  | `number` | Office request ID |

#### Request Body

```json
{
  "status": "APPROVED"
}
```

| Field    | Type                     | Required | Description        |
| -------- | ------------------------ | -------- | ------------------ |
| `status` | `APPROVED` \| `REJECTED` | **Yes**  | The action to take |

#### Response `200` — updated `OfficeRequestDTO`

#### Errors

| Code | Condition                                           |
| ---- | --------------------------------------------------- |
| 404  | Office request not found                            |
| 400  | Request is not in PENDING status (already actioned) |

---

### `DELETE /api/office-requests/:id`

**Roles:** `ADMIN`
**Description:** Permanently deletes an office request.

#### Response `200` — empty

#### Errors

| Code | Condition                |
| ---- | ------------------------ |
| 404  | Office request not found |

---

---

## 3. Journey Module — Phase 6 Additions

**Base path:** `/api/journeys`
**Tag:** `journeys-module`

Phase 6 adds a new **vehicle mode** system, an **inline asset creation** capability for NOLON rentals, a custody-aware **office create** flow, and several view sub-resources.

---

### 3.1 `POST /api/journeys/office` — Create (Employee)

**Roles:** `EMPLOYEE`
**Description:** The primary journey creation endpoint for the office flow. The caller must be an authenticated employee. This endpoint:

1. Resolves the driver/car/trailer — either by ID or inline creation (for NOLON mode)
2. Creates the journey and links it to the calling employee as `custodySource`
3. If `custodyAmount > 0`, automatically:
   - Creates an ADVANCE transaction record on the journey
   - Moves funds from the employee's account to the driver's account (`custodyMovement`)
   - Creates a `Custody` record linking the employee, driver, journey, and the driver's account

All steps are wrapped in a **database transaction** — either all succeed or all roll back.

#### Request Body

```json
{
  "vehicleMode": "NOLON_CAR",
  "clientId": 4,
  "delegateNumber": "DEL-2026-001",
  "delegateDate": "2026-06-12",
  "direction": "Cairo",
  "quantity": 100,
  "cementGrade": "Grade 52",
  "packingType": "BAGGED",
  "sellingOrderNo": "SO-001",
  "receivedCompany": "Cement Co.",
  "custodyAmount": 500,
  "driverId": 10
}
```

#### Full Field Reference

| Field               | Type                 | Required | Description                                       |
| ------------------- | -------------------- | -------- | ------------------------------------------------- |
| `vehicleMode`       | `JourneyVehicleMode` | **Yes**  | See modes table below                             |
| `clientId`          | `number`             | **Yes**  | Must reference an existing client                 |
| `driverId`          | `number`             | Depends  | Flat driver ID. Use this OR `driver` object       |
| `driver`            | `DriverAssignment`   | Depends  | `{ id }` to select, or inline NOLON fields        |
| `driverAssistantId` | `number`             | No       | User ID with `DRIVER_ASSISTANT` role              |
| `carId`             | `number`             | Depends  | Flat car ID. Use this OR `car` object             |
| `car`               | `CarAssignment`      | Depends  | `{ id }` to select, or inline NOLON fields        |
| `trailerId`         | `number`             | Depends  | Flat trailer ID. Use this OR `trailer` object     |
| `trailer`           | `TrailerAssignment`  | Depends  | `{ id }` to select, or inline NOLON fields        |
| `custodyAmount`     | `number`             | No       | Advance amount. If > 0, triggers custody creation |
| `delegateNumber`    | `string`             | No       | Authorization number                              |
| `delegateDate`      | `ISO date`           | No       | Authorization date                                |
| `direction`         | `string`             | No       | Trip destination / جهة                            |
| `quantity`          | `number`             | No       | Quantity / الكمية                                 |
| `cementGrade`       | `string`             | No       | Cement grade / رتبة الاسمنت                       |
| `packingType`       | `PackingType`        | No       | See enum reference                                |
| `sellingOrderNo`    | `string`             | No       | Selling order number                              |
| `receivedCompany`   | `string`             | No       | Received company name                             |

#### Vehicle Mode Rules

| `vehicleMode`  | Inline create allowed                                    | Required ownership on car/trailer |
| -------------- | -------------------------------------------------------- | --------------------------------- |
| `NOLON_CAR`    | **Yes** — driver, car, trailer can be created on the fly | `NOLON_CAR`                       |
| `CONTRACT_CAR` | **No** — must use existing IDs                           | `CONTRACT_CAR`                    |
| `COMPANY_CAR`  | **No** — must use existing IDs                           | `COMPANY_CAR`                     |

#### Driver / Car / Trailer Assignment Object Shapes

**Option A — Select existing by ID:**

```json
{ "id": 10 }
```

**Option B — Inline create (NOLON_CAR only):**

Driver:

```json
{
  "licenseNumber": "LIC-001",
  "licenseExpiryDate": "2030-12-31",
  "user": {
    "firstName": "Ali",
    "lastName": "Hassan",
    "nationalId": "29801010012345",
    "phoneNumber": "01001234567",
    "email": "ali@example.com",
    "password": "SecurePass1!"
  }
}
```

Car:

```json
{
  "plateNumber": "9901",
  "plateLetters": "ن ل ن",
  "licenseNumber": "LIC-CAR-001",
  "licenseExpiryDate": "2027-01-01",
  "manufacturer": "Toyota",
  "model": "Hilux",
  "manufactureYear": 2020,
  "color": "White",
  "chassisNumber": "CHASS-001"
}
```

Trailer:

```json
{
  "plateNumber": "9902",
  "plateLetters": "م ق ط",
  "maxWeight": 25000,
  "licenseNumber": "LIC-TR-001",
  "licenseExpiryDate": "2027-06-01",
  "manufacturer": "Volvo",
  "model": "FH16",
  "chassisNumber": "TR-CHASS-001"
}
```

> **Important:** You can also pass inline fields directly in the `driver`, `car`, or `trailer` field without a `create` wrapper — the system normalizes it automatically.

#### Response `201` — `JourneyDTO`

```json
{
  "id": 15,
  "delegateNumber": "DEL-2026-001",
  "delegateDate": "2026-06-12T00:00:00.000Z",
  "tripStatus": "NOTSTATED",
  "direction": "Cairo",
  "quantity": 100,
  "custodySource": { "id": 3, "user": { "firstName": "Ahmed", "lastName": "Ali" } },
  "driver": { "id": 10, "user": { ... } },
  "car": { "id": 7, "plateNumber": "9901" },
  "trailer": { "id": 5, "plateNumber": "9902" },
  "client": { "id": 4, "name": "Cement Co." },
  "createdAt": "2026-06-12T09:00:00.000Z"
}
```

#### Errors

| Code | Condition                                                |
| ---- | -------------------------------------------------------- |
| 400  | `vehicleMode` missing                                    |
| 400  | Both flat id and inline payload provided for same asset  |
| 400  | Inline create attempted for non-NOLON mode               |
| 400  | Car/trailer ownership doesn't match `vehicleMode`        |
| 404  | Driver/car/trailer by given id not found                 |
| 404  | Calling user has no linked employee record               |
| 404  | Client not found                                         |
| 404  | Employee account not found (needed for custody movement) |
| 404  | Driver account not found (needed for custody movement)   |

---

### 3.2 `POST /api/journeys` (Updated)

**Roles:** `ADMIN`

> This is the admin version and is currently commented out / superseded by `/office`. Refer to `/api/journeys/office` for active journey creation. The `PUT /:id` endpoint for admin updates is still active.

---

### 3.3 `PUT /api/journeys/:id` (Updated)

**Roles:** `ADMIN`
**Description:** Update an existing journey. Supports updating vehicle assignments (same inline NOLON logic as create). If `custodyAmount` changes, the existing ADVANCE transaction is updated, created, or deleted accordingly.

#### Path Params

| Param | Type     | Description |
| ----- | -------- | ----------- |
| `id`  | `number` | Journey ID  |

#### Request Body

Same fields as `CreateJourneyDTO` but all optional (`PartialType`). Only include what you want to change.

```json
{
  "direction": "Alexandria",
  "custodyAmount": 750
}
```

#### Custody Amount Update Behavior

| `custodyAmount` value | Existing ADVANCE tx | Result                 |
| --------------------- | ------------------- | ---------------------- |
| `> 0`                 | exists              | Amount updated         |
| `> 0`                 | does not exist      | New ADVANCE tx created |
| `0` or not provided   | exists              | ADVANCE tx deleted     |

#### Response `200` — `JourneyDTO`

#### Errors

| Code | Condition         |
| ---- | ----------------- |
| 404  | Journey not found |

---

### 3.4 `GET /api/journeys/:id/employees`

**Roles:** `ADMIN`, `USER`
**Description:** Returns the employees (custodySource + driver info) associated with a specific journey.

#### Response `200`

```json
{
  "custodySource": {
    "id": 3,
    "user": { "firstName": "Ahmed", "lastName": "Ali" }
  }
}
```

#### Errors

| Code | Condition         |
| ---- | ----------------- |
| 404  | Journey not found |

---

### 3.5 `GET /api/journeys/:id/vehicles`

**Roles:** `ADMIN`, `USER`
**Description:** Returns the vehicle details (car + trailer) for a specific journey.

#### Response `200`

```json
{
  "car": { "id": 7, "plateNumber": "9901", "plateLetters": "ن ل ن" },
  "trailer": { "id": 5, "plateNumber": "9902", "plateLetters": "م ق ط" }
}
```

#### Errors

| Code | Condition         |
| ---- | ----------------- |
| 404  | Journey not found |

---

### 3.6 `GET /api/journeys/:id/info`

**Roles:** `ADMIN`, `USER`
**Description:** Returns the basic journey info (delegate number, status, dates, direction, quantity, etc.).

#### Response `200` — Journey info fields without nested relations

---

### 3.7 `GET /api/journeys/:id` — Full Details

**Roles:** `ADMIN`, `USER`
**Description:** Returns a **comprehensive** journey object including delegate number, vehicle details, driver info, custody source, and all policy/attachment details.

#### Response `200` — Full aggregated journey object

---

### `GET /api/journeys` — List (unchanged but with updated query)

**Roles:** `ADMIN`, `USER`

#### Query Parameters

| Param           | Type            | Required | Description                                                                                         |
| --------------- | --------------- | -------- | --------------------------------------------------------------------------------------------------- |
| `page`          | `number`        | No       | Default: `1`                                                                                        |
| `pageSize`      | `number`        | No       | Default: `10`                                                                                       |
| `sortField`     | `string`        | No       | Sort field                                                                                          |
| `sortOrder`     | `ASC` \| `DESC` | No       | Sort direction                                                                                      |
| `search`        | `string`        | No       | Searches delegate number, plate, driver name, client name, policy no, archive no, delivery area/gov |
| `tripStatus`    | `JourneyStatus` | No       | Filter by status                                                                                    |
| `createdAtFrom` | `ISO date`      | No       | Date range filter start                                                                             |
| `createdAtTo`   | `ISO date`      | No       | Date range filter end                                                                               |
| `updatedAtFrom` | `ISO date`      | No       | Updated range filter start                                                                          |
| `updatedAtTo`   | `ISO date`      | No       | Updated range filter end                                                                            |

---

### `DELETE /api/journeys/:id`

**Roles:** `ADMIN`
**Description:** Permanently deletes a journey. Cascades to office requests linked to this journey.

---

---

## 4. Shared Enums Reference

### `JourneyVehicleMode`

| Value          | Description                               |
| -------------- | ----------------------------------------- |
| `NOLON_CAR`    | Rental — assets can be created inline     |
| `CONTRACT_CAR` | Contract fleet — must use existing assets |
| `COMPANY_CAR`  | Company fleet — must use existing assets  |

### `JourneyStatus`

| Value       | Description           |
| ----------- | --------------------- |
| `NOTSTATED` | Not started yet       |
| `ONROAD`    | Currently on the road |
| `COMPLETED` | Trip completed        |
| `CANCELLED` | Trip cancelled        |

### `CustodyStatus`

| Value      | Description                     |
| ---------- | ------------------------------- |
| `ACTIVE`   | Custody is active / open        |
| `INACTIVE` | Custody is inactive             |
| `CLOSED`   | Custody has been settled/closed |

### `OfficeRequestStatus`

| Value      | Description                |
| ---------- | -------------------------- |
| `PENDING`  | Awaiting admin action      |
| `APPROVED` | Admin approved the request |
| `REJECTED` | Admin rejected the request |

### `OfficeRequestType`

| Value               | Arabic            |
| ------------------- | ----------------- |
| `PRINT_DELEGATION`  | طباعة التفويض     |
| `END_WORKING_SHIFT` | إنهاء وردية العمل |
| `ASK_FOR_CUSTODY`   | طلب عُهدة         |

### `PackingType`

| Value       |
| ----------- |
| `BAGGED`    |
| `JUMBO_BAG` |
| `SILO10`    |
| `SILO12`    |
| `LOOSE`     |

### `VehicleStatus` (used in inline car/trailer creation)

| Value               |
| ------------------- |
| `AVAILABLE`         |
| `UNAVAILABLE`       |
| `ONROAD`            |
| `UNDER_MAINTENANCE` |

### `JourneyTransactionType`

| Value     | Description                 |
| --------- | --------------------------- |
| `EXPENSE` | An expense                  |
| `REVENUE` | A revenue                   |
| `ADVANCE` | A custody advance (العُهدة) |

### `JourneyTransactionCategoryType`

| Value              |
| ------------------ |
| `Office Fees`      |
| `Loading Fees`     |
| `Weighing Fees`    |
| `Card Fees`        |
| `Toll Fees`        |
| `Crossing Fees`    |
| `Port Permit Fees` |
| `Port Fees`        |
| `Diesel Fees`      |
| `Other Expenses`   |
| `Custody`          |

---

---

## 5. Flow Diagrams

### 5.1 Office Create Journey Flow (Employee)

```
Employee calls POST /api/journeys/office
│
├─ vehicleMode = NOLON_CAR?
│   ├─ Yes → resolve assets (inline create if no id given)
│   │         Driver  → created in DB if { user: { ... } }
│   │         Car     → created in DB if { plateNumber, ... }
│   │         Trailer → created in DB if { plateNumber, ... }
│   └─ No  → validate existing asset ids match ownerShip
│
├─ Validate client exists
├─ Validate driverAssistantId (if provided)
│
├─ BEGIN TRANSACTION
│   ├─ Save journey (custodySource = calling employee)
│   │
│   ├─ custodyAmount > 0?
│   │   ├─ Create JourneyTransaction (type=ADVANCE, category=Custody, amount=X)
│   │   ├─ Find employee account by name
│   │   ├─ Find driver account by name
│   │   ├─ accountService.custodyMovement(empAccount → driverAccount, X)
│   │   └─ Create Custody { employee, account=driverAccount, journey, driver, ACTIVE }
│   │
│   └─ COMMIT
│
└─ Return JourneyDTO
```

### 5.2 Office Request Lifecycle

```
Any User calls POST /api/office-requests
  { type, description, journeyId, requestedFromId, requestedToId }
           │
           ▼
    Status = PENDING (auto)
           │
           ▼
Admin calls POST /api/office-requests/:id/request-action
  { status: "APPROVED" | "REJECTED" }
           │
    ┌──────┴──────┐
    ▼             ▼
APPROVED      REJECTED
 (terminal)   (terminal)
```

### 5.3 Custody Lifecycle

```
Auto-created via /api/journeys/office (when custodyAmount > 0)
        OR
Manual POST /api/custodies by ADMIN

Status starts as: ACTIVE
        │
        ▼
  Admin updates via PUT /api/custodies/:id
        │
  ┌─────┴─────┐
  ▼           ▼
INACTIVE    CLOSED   ← journey settled / custody returned
```

---

> **Note on Pagination:** All list endpoints set these HTTP response headers:
>
> - `X-Total-Count` — total number of matching records
> - `X-Page` — current page number
> - `X-Has-Next` — `true` if more pages exist
