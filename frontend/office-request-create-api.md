# Office Request Create API — Full Reference

> **Endpoint:** `POST /api/office-requests`  
> **Auth:** Bearer token (roles: `ADMIN`, `USER`, `EMPLOYEE`)  
> **Content-Type:** `application/json`

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Request Body](#request-body)
4. [Field Reference](#field-reference)
5. [Request Types](#request-types)
6. [Validation Rules](#validation-rules)
7. [Auto-Resolution Logic](#auto-resolution-logic)
8. [Response](#response)
9. [Error Responses](#error-responses)
10. [Examples](#examples)

---

## Overview

Creates a new office request. Office requests are submitted by employees to an admin and represent one of three workflow actions:

| Type                | Purpose                                                                      |
| ------------------- | ---------------------------------------------------------------------------- |
| `PRINT_DELEGATION`  | Request to reprint a journey delegation document                             |
| `END_WORKING_SHIFT` | Employee requests to end their shift (triggers custody transfer on approval) |
| `ASK_FOR_CUSTODY`   | Employee requests custody funds (triggers account movement on approval)      |

All newly created requests start with status `PENDING` and must be acted on by an admin via `POST /api/office-requests/:id/request-action`.

---

## Authentication & Authorization

- **Header:** `Authorization: Bearer <token>`
- **Allowed roles:** `ADMIN`, `USER`, `EMPLOYEE`
- **EMPLOYEE role behavior:** `requestedFromId` is automatically resolved from the authenticated user's linked employee record — the field is ignored even if sent.

---

## Request Body

```json
{
  "type": "PRINT_DELEGATION | END_WORKING_SHIFT | ASK_FOR_CUSTODY",
  "description": "Optional free-text description",
  "journeyId": 42,
  "requestedFromId": 7,
  "requestedToId": 3
}
```

---

## Field Reference

| Field             | Type      | Required        | Description                                                                                                  |
| ----------------- | --------- | --------------- | ------------------------------------------------------------------------------------------------------------ |
| `type`            | `enum`    | **Yes**         | Request type. One of `PRINT_DELEGATION`, `END_WORKING_SHIFT`, `ASK_FOR_CUSTODY`                              |
| `description`     | `string`  | No              | Free-text details about the request                                                                          |
| `journeyId`       | `integer` | **Conditional** | **Required** when `type = PRINT_DELEGATION`. Optional (but validated if provided) for other types            |
| `requestedFromId` | `integer` | **Conditional** | Employee ID submitting the request. Auto-set from JWT for `EMPLOYEE` role. Required for `ADMIN`/`USER` roles |
| `requestedToId`   | `integer` | No              | Employee ID the request is directed to. Auto-set to the admin employee when omitted                          |

---

## Request Types

### `PRINT_DELEGATION`

Request to reset a journey's delegation print state so the document can be reprinted.

- `journeyId` **must** be provided and must reference an existing journey.
- On approval, the journey's delegation print state is reset to `NOT_PRINTED`.

### `END_WORKING_SHIFT`

Employee signals the end of their working shift.

- `journeyId` is optional but validated if provided.
- On approval, an admin supplies custody details via the action endpoint:
  - The employee's custody account balance is transferred to either the treasury or another employee.
  - The employee's active custody record for the journey is closed (`CLOSED`).

### `ASK_FOR_CUSTODY`

Employee requests custody funds to be allocated to them.

- `journeyId` is optional but validated if provided.
- On approval, an admin supplies the amount and source:
  - Funds move from the treasury (or another employee's account) to the requesting employee's account.
  - If the employee has no custody account yet, one is created automatically.

---

## Validation Rules

| Rule                                               | Details                                                                                                 |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `type` is required                                 | Must be a valid `OfficeRequestType` enum value                                                          |
| `journeyId` required for `PRINT_DELEGATION`        | Returns `400` if missing                                                                                |
| `journeyId` validated when provided                | Returns `404` if journey does not exist                                                                 |
| `requestedFromId` required for non-EMPLOYEE roles  | Returns `400` if not provided and role is not `EMPLOYEE`                                                |
| `requestedFromId` must reference existing employee | Returns `404` if employee not found                                                                     |
| `requestedToId` must reference existing employee   | Returns `404` if employee not found                                                                     |
| Auto-admin fallback for `requestedToId`            | If omitted, the system finds the first employee linked to an `ADMIN` user. Returns `400` if none exists |

---

## Auto-Resolution Logic

### `requestedFromId` (EMPLOYEE role only)

When the authenticated user has role `EMPLOYEE`, the system ignores the `requestedFromId` field in the request body and instead looks up the employee record linked to the current user's JWT `id`. If no employee record is found, a `404` is returned.

### `requestedToId` (all roles, when omitted)

If `requestedToId` is not provided, the system queries for the first employee whose linked user has role `ADMIN`. This employee becomes the default recipient of the request. If no such employee exists in the database, the request fails with `400`.

---

## Response

**Status:** `201 Created`

```json
{
  "id": 15,
  "status": "PENDING",
  "type": "ASK_FOR_CUSTODY",
  "description": "Need funds for supplies",
  "createdAt": "2026-06-23T10:00:00.000Z",
  "updatedAt": "2026-06-23T10:00:00.000Z",
  "createdBy": "user@example.com",
  "journey": null,
  "requestedFrom": {
    "id": 7,
    "user": {
      "id": 3,
      "firstName": "Ahmed",
      "lastName": "Said",
      "role": "EMPLOYEE"
    }
  },
  "requestedTo": {
    "id": 3,
    "user": {
      "id": 1,
      "firstName": "Admin",
      "lastName": "User",
      "role": "ADMIN"
    }
  }
}
```

The response always includes the full `requestedFrom` and `requestedTo` employee objects with their nested `user`, plus the `journey` object when a `journeyId` was provided.

---

## Error Responses

| Status             | Code / Condition                              | Description                                                                   |
| ------------------ | --------------------------------------------- | ----------------------------------------------------------------------------- |
| `400 Bad Request`  | `type` missing or invalid                     | Must be one of the valid enum values                                          |
| `400 Bad Request`  | `journeyId` missing for `PRINT_DELEGATION`    | `journeyId` is required for this type                                         |
| `400 Bad Request`  | `requestedFromId` missing (non-EMPLOYEE role) | Admin/User must supply `requestedFromId`                                      |
| `400 Bad Request`  | No admin employee found (auto-resolve failed) | Create an employee linked to an ADMIN user or pass `requestedToId` explicitly |
| `404 Not Found`    | Journey not found                             | `journeyId` references a non-existent journey                                 |
| `404 Not Found`    | Requesting employee not found                 | `requestedFromId` references a non-existent employee                          |
| `404 Not Found`    | Target employee not found                     | `requestedToId` references a non-existent employee                            |
| `404 Not Found`    | No employee linked to authenticated user      | EMPLOYEE user has no linked employee record                                   |
| `401 Unauthorized` | Missing or invalid token                      | Bearer token is absent or expired                                             |
| `403 Forbidden`    | Role not allowed                              | Only `ADMIN`, `USER`, `EMPLOYEE` roles may call this endpoint                 |

---

## Examples

### 1. Employee requests custody (EMPLOYEE role — minimal body)

The employee JWT automatically sets `requestedFromId`; `requestedToId` defaults to the admin employee.

```http
POST /api/office-requests
Authorization: Bearer <employee-jwt>
Content-Type: application/json

{
  "type": "ASK_FOR_CUSTODY",
  "description": "Need petty cash for fuel"
}
```

---

### 2. Employee requests to end shift (EMPLOYEE role — with journey)

```http
POST /api/office-requests
Authorization: Bearer <employee-jwt>
Content-Type: application/json

{
  "type": "END_WORKING_SHIFT",
  "journeyId": 12,
  "description": "Completed route, handing over custody"
}
```

---

### 3. Admin or User creates request on behalf of an employee

```http
POST /api/office-requests
Authorization: Bearer <admin-jwt>
Content-Type: application/json

{
  "type": "ASK_FOR_CUSTODY",
  "requestedFromId": 7,
  "requestedToId": 3,
  "description": "Custody request on behalf of driver"
}
```

---

### 4. Print delegation reprint request

`journeyId` is mandatory for this type.

```http
POST /api/office-requests
Authorization: Bearer <employee-jwt>
Content-Type: application/json

{
  "type": "PRINT_DELEGATION",
  "journeyId": 42,
  "description": "Delegation document was damaged"
}
```

---

## Related Endpoints

| Method   | Path                                      | Description                                      |
| -------- | ----------------------------------------- | ------------------------------------------------ |
| `GET`    | `/api/office-requests`                    | List all office requests (paginated, filterable) |
| `GET`    | `/api/office-requests/:id`                | Get a single office request by ID                |
| `POST`   | `/api/office-requests/:id/request-action` | Admin approves or rejects a pending request      |
| `DELETE` | `/api/office-requests/:id`                | Admin deletes a request (admin only)             |
