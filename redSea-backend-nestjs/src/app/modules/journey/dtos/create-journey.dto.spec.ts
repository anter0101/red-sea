import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { CreateJourneyDTO } from './create-journey.dto';
import { JourneyVehicleMode } from 'src/core/enums/journey-vehicle-mode';
import { JourneyStatus } from 'src/core/enums/journey';
import { PackingType } from 'src/core/enums/packing-type';

function flattenValidationPaths(errors: ValidationError[], prefix = ''): string[] {
  return errors.flatMap((e) => {
    const path = prefix ? `${prefix}.${e.property}` : e.property;
    const self = e.constraints ? [path] : [];
    const children = flattenValidationPaths(e.children ?? [], path);
    return [...self, ...children];
  });
}

async function validateCreateJourney(plain: Record<string, unknown>) {
  const dto = plainToInstance(CreateJourneyDTO, plain, { enableImplicitConversion: true });
  return validate(dto, { whitelist: true, forbidNonWhitelisted: false });
}

function basePayload(overrides: Record<string, unknown> = {}) {
  return {
    vehicleMode: JourneyVehicleMode.COMPANY_CAR,
    clientId: 1,
    direction: 'Cairo',
    packingType: PackingType.BAGGED,
    quantity: 80,
    driverId: 1,
    carId: 2,
    trailerId: 2,
    receivedCompany: 'ACME',
    sellingOrderNo: 'SO-001',
    ...overrides,
  };
}

describe('CreateJourneyDTO', () => {
  describe('valid payloads — all vehicle modes with flat driverId/carId/trailerId', () => {
    it.each([
      JourneyVehicleMode.COMPANY_CAR,
      JourneyVehicleMode.CONTRACT_CAR,
      JourneyVehicleMode.NOLON_CAR,
    ])('accepts %s with flat asset ids', async (vehicleMode) => {
      const errors = await validateCreateJourney(
        basePayload({
          vehicleMode,
          driverId: 1,
          carId: 2,
          trailerId: 3,
        }),
      );
      expect(errors).toHaveLength(0);
    });
  });

  describe('valid payloads — NOLON nested select (driver/car/trailer.id)', () => {
    it('accepts nested id assignments without flat ids', async () => {
      const errors = await validateCreateJourney({
        vehicleMode: JourneyVehicleMode.NOLON_CAR,
        clientId: 1,
        direction: 'Giza',
        packingType: PackingType.BAGGED,
        quantity: 50,
        driver: { id: 1 },
        car: { id: 3 },
        trailer: { id: 1 },
        receivedCompany: 'Rental Client',
        sellingOrderNo: 'SO-003',
      });
      expect(errors).toHaveLength(0);
    });

    it('accepts mixed flat driverId and nested car/trailer', async () => {
      const errors = await validateCreateJourney({
        vehicleMode: JourneyVehicleMode.NOLON_CAR,
        clientId: 1,
        driverId: 1,
        car: { id: 3 },
        trailer: { id: 1 },
      });
      expect(errors).toHaveLength(0);
    });
  });

  describe('valid optional journey fields', () => {
    it('accepts full optional metadata', async () => {
      const errors = await validateCreateJourney(
        basePayload({
          tripStatus: JourneyStatus.DELEGATION_ISSUED,
          cementGrade: '42.5',
          custodyAmount: 5000,
          driverAssistantId: 4,
        }),
      );
      expect(errors).toHaveLength(0);
    });

    it('transforms string clientId and custodyAmount to numbers', async () => {
      const dto = plainToInstance(
        CreateJourneyDTO,
        basePayload({ clientId: '1', custodyAmount: '3000' }),
      );
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
      expect(dto.clientId).toBe(1);
      expect(dto.custodyAmount).toBe(3000);
    });
  });

  describe('invalid — required fields', () => {
    it('rejects missing vehicleMode', async () => {
      const { vehicleMode: _, ...rest } = basePayload();
      const errors = await validateCreateJourney(rest);
      const paths = flattenValidationPaths(errors);
      expect(paths.some((p) => p.includes('vehicleMode'))).toBe(true);
    });

    it('rejects missing clientId', async () => {
      const { clientId: _, ...rest } = basePayload();
      const errors = await validateCreateJourney(rest);
      const paths = flattenValidationPaths(errors);
      expect(paths.some((p) => p.includes('clientId'))).toBe(true);
    });

    it('rejects invalid vehicleMode enum', async () => {
      const errors = await validateCreateJourney(
        basePayload({ vehicleMode: 'RENT' as JourneyVehicleMode }),
      );
      expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects invalid packingType', async () => {
      const errors = await validateCreateJourney(
        basePayload({ packingType: 'INVALID' as PackingType }),
      );
      expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects non-integer clientId', async () => {
      const errors = await validateCreateJourney(basePayload({ clientId: 'not-a-number' }));
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('invalid — nested assignment shape', () => {
    it('rejects non-integer driver.id', async () => {
      const errors = await validateCreateJourney(
        basePayload({
          vehicleMode: JourneyVehicleMode.NOLON_CAR,
          driverId: undefined,
          carId: undefined,
          trailerId: undefined,
          driver: { id: 'x' as unknown as number },
          car: { id: 1 },
          trailer: { id: 1 },
        }),
      );
      expect(errors.length).toBeGreaterThan(0);
    });

    it('rejects non-integer carId', async () => {
      const errors = await validateCreateJourney(basePayload({ carId: 'two' }));
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('NOLON inline create — unwrapped driver/car/trailer', () => {
    it('accepts inline fields without create wrapper', async () => {
      const errors = await validateCreateJourney({
        vehicleMode: JourneyVehicleMode.NOLON_CAR,
        clientId: 1,
        direction: 'Giza',
        packingType: PackingType.BAGGED,
        quantity: 50,
        driver: {
          user: {
            firstName: 'Nolon',
            lastName: 'Driver',
            nationalId: 2,
            phoneNumber: '010051515',
          },
        },
        car: {
          plateNumber: '9901',
          plateLetters: 'ن ل ن',
          licenseNumber: 'LIC-NOLON-CAR-001',
          licenseExpiryDate: '2027-01-01',
        },
        trailer: {
          maxWeight: 25,
          plateNumber: '9902',
          plateLetters: 'م ق ط',
          licenseNumber: 'LIC-NOLON-TRL-001',
          licenseExpiryDate: '2027-06-01',
        },
        receivedCompany: 'Rental Client',
        sellingOrderNo: 'SO-003-INLINE',
      });
      expect(errors).toHaveLength(0);
    });

    it('still accepts legacy create wrapper', async () => {
      const errors = await validateCreateJourney({
        vehicleMode: JourneyVehicleMode.NOLON_CAR,
        clientId: 1,
        driver: {
          create: {
            user: {
              firstName: 'Legacy',
              lastName: 'Wrap',
              phoneNumber: '0100999888',
            },
          },
        },
        car: {
          create: {
            plateNumber: '8801',
            plateLetters: 'ل ق م',
            licenseNumber: 'LIC-NOLON-CAR-002',
            licenseExpiryDate: '2027-06-01',
          },
        },
        trailer: {
          create: {
            plateNumber: '8802',
            plateLetters: 'ن ل ن',
            licenseNumber: 'LIC-NOLON-TRL-002',
            licenseExpiryDate: '2027-06-01',
          },
        },
      });
      expect(errors).toHaveLength(0);
    });
  });
});
