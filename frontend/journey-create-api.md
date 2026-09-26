# Journey Create API — Full Reference

> **Endpoint:** `POST /api/journeys/office`  
> **Auth:** Bearer token (role: `EMPLOYEE`)  
> **Content-Type:** `application/json`

---

## Table of Contents

1. [Enums](#enums)
2. [Field Types Reference](#field-types-reference)
3. [Car Assignment Strategies](#car-assignment-strategies)
4. [Driver Assignment Strategies](#driver-assignment-strategies)
5. [Trailer Assignment Strategies](#trailer-assignment-strategies)
6. [All Request Cases](#all-request-cases)
7. [Response Shape](#response-shape)
8. [Error Cases](#error-cases)

---

## Enums

### `vehicleMode` — `JourneyVehicleMode`

| Value          | Description                                                         |
| -------------- | ------------------------------------------------------------------- |
| `NOLON_CAR`    | Rental / external car — inline car/driver/trailer or select by `id` |
| `CONTRACT_CAR` | Contract fleet — select existing assets by id only                  |
| `COMPANY_CAR`  | Company fleet — select existing assets by id only                   |

> **This document covers `NOLON_CAR` mode only.**

---

### `packingType` — `PackingType`

| Value       |
| ----------- |
| `BAGGED`    |
| `JUMBO_BAG` |
| `SILO10`    |
| `SILO12`    |
| `LOOSE`     |

---

### `tripStatus` — `JourneyStatus`

| Value       |
| ----------- |
| `NOTSTATED` |
| `ONROAD`    |
| `COMPLETED` |
| `CANCELLED` |

---

### Car / Trailer `status` — `VeachleStatus`

| Value               |
| ------------------- |
| `AVAILABLE`         |
| `UNAVAILABLE`       |
| `ONROAD`            |
| `UNDER_MAINTENANCE` |

---

## Field Types Reference

### Top-level `CreateJourneyDTO`

| Field               | Type                 | Required  | Description                                   |
| ------------------- | -------------------- | --------- | --------------------------------------------- |
| `vehicleMode`       | `JourneyVehicleMode` | **YES**   | Must be `NOLON_CAR`                           |
| `clientId`          | `number`             | **YES**   | Existing client id                            |
| `car`               | `CarAssignment`      | **YES\*** | Inline car fields or `{ id }`                 |
| `driverId`          | `number`             | NO        | Shorthand for existing driver id              |
| `driver`            | `DriverAssignment`   | NO        | Inline driver or `{ id }`                     |
| `driverAssistantId` | `number`             | NO        | Existing user id with role `DRIVER_ASSISTANT` |
| `trailerId`         | `number`             | NO        | Shorthand for existing trailer id             |
| `trailer`           | `TrailerAssignment`  | NO        | Inline trailer or `{ id }`                    |
| `delegateNumber`    | `string`             | NO        | Authorization / delegation number             |
| `delegateDate`      | `string (ISO date)`  | NO        | e.g. `"2026-06-23"`                           |
| `tripStatus`        | `JourneyStatus`      | NO        | Default: `NOTSTATED`                          |
| `direction`         | `string`             | NO        | Destination / جهة                             |
| `quantity`          | `number`             | NO        | Cargo quantity                                |
| `cementGrade`       | `string`             | NO        | Cement grade / رتبة الاسمنت                   |
| `packingType`       | `PackingType`        | NO        | Packing method                                |
| `sellingOrderNo`    | `string`             | NO        | Selling order number                          |
| `receivedCompany`   | `string`             | NO        | Receiving company name                        |
| `custodyAmount`     | `number`             | NO        | Advance custody amount (integer)              |

> \*`car.plateNumber` and `car.plateLetters` are required when creating inline. If using `{ id }`, just pass the id.

---

### `NolonInlineCarDTO` — inline car fields

| Field               | Type                | Required | Default if omitted                         |
| ------------------- | ------------------- | -------- | ------------------------------------------ |
| `plateNumber`       | `string`            | **YES**  | —                                          |
| `plateLetters`      | `string`            | **YES**  | —                                          |
| `licenseNumber`     | `string`            | NO       | Auto-generated `NOLON-LIC-CAR-{timestamp}` |
| `licenseExpiryDate` | `string (ISO date)` | NO       | `"2030-12-31"`                             |
| `manufacturer`      | `string`            | NO       | `"Nolon"`                                  |
| `model`             | `string`            | NO       | `"Rental"`                                 |
| `manufactureYear`   | `number`            | NO       | Current year                               |
| `color`             | `string`            | NO       | `"White"`                                  |
| `chassisNumber`     | `string`            | NO       | Auto-generated `NOLON-CAR-{timestamp}`     |
| `status`            | `VeachleStatus`     | NO       | `"AVAILABLE"`                              |

---

### `NolonInlineDriverDTO` — inline driver fields

| Field               | Type                 | Required | Default if omitted                 |
| ------------------- | -------------------- | -------- | ---------------------------------- |
| `user`              | `NolonInlineUserDTO` | **YES**  | —                                  |
| `licenseNumber`     | `string`             | NO       | Auto-generated `NOLON-{timestamp}` |
| `licenseExpiryDate` | `string (ISO date)`  | NO       | `"2030-12-31"`                     |

---

### `NolonInlineUserDTO` — driver's user info

| Field         | Type               | Required | Notes                       |
| ------------- | ------------------ | -------- | --------------------------- |
| `firstName`   | `string`           | **YES**  | —                           |
| `lastName`    | `string`           | **YES**  | —                           |
| `nationalId`  | `string \| number` | NO       | Stored as `user.personalId` |
| `phoneNumber` | `string`           | NO       | Stored in `Contact` entity  |
| `email`       | `string`           | NO       | —                           |
| `password`    | `string`           | NO       | —                           |

---

### `NolonInlineTrailerDTO` — inline trailer fields

| Field               | Type                | Required | Default if omitted |
| ------------------- | ------------------- | -------- | ------------------ |
| `plateNumber`       | `string`            | **YES**  | —                  |
| `plateLetters`      | `string`            | **YES**  | —                  |
| `maxWeight`         | `number`            | NO       | `25000`            |
| `licenseNumber`     | `string`            | NO       | Auto-generated     |
| `licenseExpiryDate` | `string (ISO date)` | NO       | `"2030-12-31"`     |
| `manufacturer`      | `string`            | NO       | `"Nolon"`          |
| `model`             | `string`            | NO       | `"Rental"`         |
| `chassisNumber`     | `string`            | NO       | Auto-generated     |
| `status`            | `VeachleStatus`     | NO       | `"AVAILABLE"`      |

---

## Car Assignment Strategies

```
car: { "id": 5 }                  → select existing car by id
car: { "plateNumber": "...", ... } → create new NOLON car inline
carId: 5                           → flat shorthand for existing car id
```

> When you provide `car: { id }`, no other car fields are needed.  
> When you provide inline fields, `plateNumber` and `plateLetters` are required.

---

## Driver Assignment Strategies

```
driverId: 3                        → flat shorthand for existing driver id
driver: { "id": 7 }               → select existing driver by id
driver: { "user": { ... } }       → create new NOLON driver inline
```

> All three strategies are valid in NOLON mode.  
> If no driver is provided, the journey is created without one.

---

## Trailer Assignment Strategies

```
trailerId: 2                       → flat shorthand for existing trailer id
trailer: { "id": 4 }              → select existing trailer by id
trailer: { "plateNumber": "...", ... } → create new NOLON trailer inline
```

> Trailer is always optional.

---

## All Request Cases

---

### Case 1 — Full NOLON (create everything inline, all fields)

```json
{
  "vehicleMode": "NOLON_CAR",
  "clientId": 1,
  "delegateNumber": "DEL-2026-001",
  "delegateDate": "2026-06-23",
  "tripStatus": "NOTSTATED",
  "direction": "جدة",
  "quantity": 500,
  "cementGrade": "A",
  "packingType": "BAGGED",
  "sellingOrderNo": "SO-2026-001",
  "receivedCompany": "شركة الاستلام للمقاولات",
  "custodyAmount": 1500,
  "car": {
    "plateNumber": "9901",
    "plateLetters": "ن ل ن",
    "licenseNumber": "LIC-NOLON-CAR-001",
    "licenseExpiryDate": "2027-01-01",
    "manufacturer": "Toyota",
    "model": "Hilux",
    "manufactureYear": 2020,
    "color": "White",
    "chassisNumber": "CH-000111",
    "status": "AVAILABLE"
  },
  "driver": {
    "licenseNumber": "LIC-NOLON-DRV-001",
    "licenseExpiryDate": "2030-12-31",
    "user": {
      "firstName": "Ahmed",
      "lastName": "Ali",
      "nationalId": "1012345678",
      "phoneNumber": "0501234567",
      "email": "ahmed.ali@nolon.com"
    }
  },
  "trailer": {
    "plateNumber": "9902",
    "plateLetters": "م ق ط",
    "maxWeight": 25000,
    "licenseNumber": "LIC-NOLON-TRL-001",
    "licenseExpiryDate": "2027-06-01",
    "manufacturer": "Hino",
    "model": "700",
    "chassisNumber": "TR-CH-0099",
    "status": "AVAILABLE"
  }
}
```

---

### Case 2 — Minimal NOLON (required fields only)

```json
{
  "vehicleMode": "NOLON_CAR",
  "clientId": 1,
  "car": {
    "plateNumber": "0001",
    "plateLetters": "ن ل ن"
  }
}
```

> Defaults applied: car manufacturer = `Nolon`, model = `Rental`, color = `White`, licenseExpiry = `2030-12-31`.  
> Driver and trailer are omitted — journey is created without them.

---

### Case 3 — Inline car + inline driver (no trailer)

```json
{
  "vehicleMode": "NOLON_CAR",
  "clientId": 1,
  "car": {
    "plateNumber": "1234",
    "plateLetters": "أ ب ت",
    "licenseNumber": "LIC-001",
    "licenseExpiryDate": "2028-06-01"
  },
  "driver": {
    "user": {
      "firstName": "Khalid",
      "lastName": "Hassan",
      "nationalId": "1098765432",
      "phoneNumber": "0559876543"
    }
  }
}
```

---

### Case 4 — Inline car + select existing driver by `driverId`

```json
{
  "vehicleMode": "NOLON_CAR",
  "clientId": 1,
  "driverId": 3,
  "car": {
    "plateNumber": "5555",
    "plateLetters": "س م د"
  }
}
```

---

### Case 5 — Inline car + select existing driver by `driver.id`

```json
{
  "vehicleMode": "NOLON_CAR",
  "clientId": 1,
  "driver": { "id": 7 },
  "car": {
    "plateNumber": "7777",
    "plateLetters": "ر ي م"
  }
}
```

---

### Case 6 — Select existing car by `carId` + inline driver

```json
{
  "vehicleMode": "NOLON_CAR",
  "clientId": 1,
  "carId": 5,
  "driver": {
    "licenseNumber": "LIC-NOLON-007",
    "user": {
      "firstName": "Omar",
      "lastName": "Saeed",
      "phoneNumber": "0531112233"
    }
  }
}
```

---

### Case 7 — Select existing car by `car.id` + inline driver

```json
{
  "vehicleMode": "NOLON_CAR",
  "clientId": 1,
  "car": { "id": 5 },
  "driver": {
    "user": {
      "firstName": "Faisal",
      "lastName": "Nasser",
      "nationalId": "1055566677"
    }
  }
}
```

---

### Case 8 — Select all existing assets (car + driver + trailer) by id

```json
{
  "vehicleMode": "NOLON_CAR",
  "clientId": 1,
  "carId": 5,
  "driverId": 3,
  "trailerId": 2
}
```

---

### Case 9 — Inline car + inline driver + select existing trailer by `trailerId`

```json
{
  "vehicleMode": "NOLON_CAR",
  "clientId": 1,
  "trailerId": 4,
  "car": {
    "plateNumber": "3399",
    "plateLetters": "ب ط ل"
  },
  "driver": {
    "user": {
      "firstName": "Hassan",
      "lastName": "Muhammed"
    }
  }
}
```

---

### Case 10 — Inline car + inline driver + inline trailer + driver assistant

```json
{
  "vehicleMode": "NOLON_CAR",
  "clientId": 1,
  "driverAssistantId": 12,
  "car": {
    "plateNumber": "8821",
    "plateLetters": "ع م ر"
  },
  "driver": {
    "user": {
      "firstName": "Abdulaziz",
      "lastName": "Turki",
      "phoneNumber": "0512345678"
    }
  },
  "trailer": {
    "plateNumber": "4411",
    "plateLetters": "ي ن م",
    "maxWeight": 30000
  }
}
```

> `driverAssistantId` must be an existing user with role `DRIVER_ASSISTANT`.

---

### Case 11 — Full journey with custody amount and all metadata

```json
{
  "vehicleMode": "NOLON_CAR",
  "clientId": 2,
  "delegateNumber": "DEL-2026-099",
  "delegateDate": "2026-06-23",
  "direction": "مكة المكرمة",
  "quantity": 1200,
  "cementGrade": "B",
  "packingType": "JUMBO_BAG",
  "sellingOrderNo": "SO-2026-099",
  "receivedCompany": "مصنع الاسمنت السعودي",
  "custodyAmount": 3000,
  "car": {
    "plateNumber": "6600",
    "plateLetters": "ن م ر",
    "manufacturer": "Mercedes",
    "model": "Actros",
    "manufactureYear": 2022,
    "color": "Blue",
    "licenseNumber": "LIC-MERC-001",
    "licenseExpiryDate": "2029-01-01"
  },
  "driver": {
    "licenseNumber": "LIC-DRV-2026-001",
    "licenseExpiryDate": "2031-06-30",
    "user": {
      "firstName": "Ibrahim",
      "lastName": "Saleh",
      "nationalId": "1099887766",
      "phoneNumber": "0507654321",
      "email": "ibrahim.saleh@mail.com"
    }
  },
  "trailer": {
    "plateNumber": "2211",
    "plateLetters": "س ع د",
    "maxWeight": 40000,
    "manufacturer": "Schmitz",
    "model": "S.CS",
    "licenseNumber": "LIC-TRL-2026-001",
    "licenseExpiryDate": "2028-03-15"
  }
}
```

---

### Case 12 — Inline car only, no driver, no trailer, with trip metadata

```json
{
  "vehicleMode": "NOLON_CAR",
  "clientId": 3,
  "delegateNumber": "DEL-2026-200",
  "delegateDate": "2026-06-23",
  "direction": "الرياض",
  "packingType": "LOOSE",
  "car": {
    "plateNumber": "1100",
    "plateLetters": "ز ر ق"
  }
}
```

---

## Response Shape

**Status: `201 Created`**

```json
{
  "id": 42,
  "delegateNumber": "DEL-2026-001",
  "delegateDate": "2026-06-23T00:00:00.000Z",
  "tripStatus": "NOTSTATED",
  "direction": "جدة",
  "quantity": 500,
  "cementGrade": "A",
  "packingType": "BAGGED",
  "sellingOrderNo": "SO-2026-001",
  "receivedCompany": "شركة الاستلام للمقاولات",
  "driver": {
    "id": 15,
    "licenseNumber": "LIC-NOLON-DRV-001",
    "user": {
      "id": 22,
      "firstName": "Ahmed",
      "lastName": "Ali"
    }
  },
  "car": {
    "id": 9,
    "plateNumber": "9901",
    "plateLetters": "ن ل ن"
  },
  "trailer": {
    "id": 6,
    "plateNumber": "9902",
    "plateLetters": "م ق ط"
  },
  "client": {
    "id": 1
  },
  "custodySource": {
    "id": 3,
    "user": {
      "firstName": "Employee",
      "lastName": "Name"
    }
  },
  "createdAt": "2026-06-23T10:00:00.000Z",
  "updatedAt": "2026-06-23T10:00:00.000Z",
  "createdBy": "employee@company.com"
}
```

### Response fields

| Field             | Type                   | Notes                         |
| ----------------- | ---------------------- | ----------------------------- |
| `id`              | `number`               | Journey id                    |
| `delegateNumber`  | `string \| null`       | Authorization number          |
| `delegateDate`    | `ISO datetime \| null` |                               |
| `tripStatus`      | `JourneyStatus`        |                               |
| `direction`       | `string \| null`       |                               |
| `quantity`        | `number \| null`       |                               |
| `cementGrade`     | `string \| null`       |                               |
| `packingType`     | `PackingType \| null`  |                               |
| `sellingOrderNo`  | `string \| null`       |                               |
| `receivedCompany` | `string \| null`       |                               |
| `driver`          | `object \| null`       | Nested driver with user       |
| `driverAssistant` | `object \| null`       | Nested user                   |
| `car`             | `object \| null`       | Nested car                    |
| `trailer`         | `object \| null`       | Nested trailer                |
| `client`          | `object`               | Nested client                 |
| `custodySource`   | `object \| null`       | Employee who assigned custody |
| `createdAt`       | `ISO datetime`         |                               |
| `updatedAt`       | `ISO datetime`         |                               |
| `createdBy`       | `string`               | Email of creator              |

> **Note:** `custodyAmount` is **not** returned in the response. It is stored as a `JourneyTransaction` record internally. A delegation print record is also auto-created on successful journey creation.

---

## Error Cases

| Condition                                                 | Status | Message                                       |
| --------------------------------------------------------- | ------ | --------------------------------------------- |
| `clientId` does not exist                                 | `404`  | `Client with id {id} not found`               |
| `driverAssistantId` does not exist or wrong role          | `404`  | `Assistant driver with id {id} not found`     |
| Logged-in employee not found                              | `404`  | `Employee with user id {id} not found`        |
| `custodyAmount > 0` but driver account not found          | `404`  | `Driver account with name {name} not found`   |
| `custodyAmount > 0` but employee account not found        | `404`  | `Employee account with name {name} not found` |
| Missing `vehicleMode`                                     | `400`  | Validation error                              |
| Missing `clientId`                                        | `400`  | Validation error                              |
| Inline car missing `plateNumber` or `plateLetters`        | `400`  | Validation error                              |
| Inline driver missing `user.firstName` or `user.lastName` | `400`  | Validation error                              |
| Inline trailer missing `plateNumber` or `plateLetters`    | `400`  | Validation error                              |

---

## Quick Reference — Car Field Combinations

```
# New car (required only)
"car": { "plateNumber": "1234", "plateLetters": "أ ب ت" }

# New car (full)
"car": {
  "plateNumber": "1234", "plateLetters": "أ ب ت",
  "licenseNumber": "...", "licenseExpiryDate": "2027-01-01",
  "manufacturer": "Toyota", "model": "Hilux",
  "manufactureYear": 2020, "color": "White",
  "chassisNumber": "CH-001", "status": "AVAILABLE"
}

# Existing car by object
"car": { "id": 5 }

# Existing car by flat field
"carId": 5
```

## Quick Reference — Driver Field Combinations

```
# Existing driver by flat field
"driverId": 3

# Existing driver by object
"driver": { "id": 7 }

# New driver (required only)
"driver": { "user": { "firstName": "Ahmed", "lastName": "Ali" } }

# New driver (full)
"driver": {
  "licenseNumber": "LIC-001",
  "licenseExpiryDate": "2030-12-31",
  "user": {
    "firstName": "Ahmed", "lastName": "Ali",
    "nationalId": "1012345678",
    "phoneNumber": "0501234567",
    "email": "ahmed@mail.com"
  }
}
```

## Quick Reference — Trailer Field Combinations

```
# No trailer (omit the field entirely)

# Existing trailer by flat field
"trailerId": 2

# Existing trailer by object
"trailer": { "id": 4 }

# New trailer (required only)
"trailer": { "plateNumber": "9902", "plateLetters": "م ق ط" }

# New trailer (full)
"trailer": {
  "plateNumber": "9902", "plateLetters": "م ق ط",
  "maxWeight": 25000,
  "licenseNumber": "LIC-TRL-001",
  "licenseExpiryDate": "2027-06-01",
  "manufacturer": "Hino", "model": "700",
  "chassisNumber": "TR-001", "status": "AVAILABLE"
}
```
