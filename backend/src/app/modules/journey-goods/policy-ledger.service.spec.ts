import { BadRequestException } from '@nestjs/common';
import { JourneyTransactionCategoryType } from 'src/core/enums/journey';
import { OwnerShipType } from 'src/core/enums/ownerShip-types';
import { PolicyLedgerService } from './policy-ledger.service';

const driverCustody = { id: 50, name: 'سائق 1', parentAccount: { name: 'عهد' } };

function build(options: {
  ownerShip?: OwnerShipType;
  rows?: Array<{ id?: number; category: string; amount: number | string }>;
  custody?: unknown;
  posted?: string[];
}) {
  const rows = options.rows ?? [];
  const posted = options.posted ?? [];
  const journey = {
    id: 5,
    client: { id: 1, name: 'Client' },
    car: { ownerShip: options.ownerShip ?? OwnerShipType.COMPANY_CAR },
    actualRevenue: 2000,
    transportSupplier: null,
    custodySource: null,
  };

  const policyRepo = { findOne: jest.fn().mockResolvedValue({ id: 10 }) };
  const journeyRepo = { findOne: jest.fn().mockResolvedValue(journey), save: jest.fn() };
  const jtRepo = {
    find: jest.fn().mockResolvedValue(rows),
    findOne: jest.fn(({ where }) =>
      Promise.resolve(rows.find((row) => row.category === where.category) ?? null),
    ),
    save: jest.fn((row) => Promise.resolve(row)),
    delete: jest.fn(),
  };
  const txRepo = {
    findOne: jest.fn(({ where }) =>
      Promise.resolve(
        posted.some((category) => where.idempotencyKey.endsWith(`:TRN3:${category}`))
          ? { id: 1 }
          : null,
      ),
    ),
    createQueryBuilder: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawMany: jest
        .fn()
        .mockResolvedValue(
          posted.map((category) => ({ key: `policy:10:journey:5:TRN3:${category}` })),
        ),
    })),
  };
  const custodyRepo = {
    findOne: jest
      .fn()
      .mockResolvedValue(
        options.custody === undefined ? { account: driverCustody } : options.custody,
      ),
  };
  const accountService = {
    createClientAccounts: jest.fn(),
    findActorLeaf: jest.fn((key: string) =>
      Promise.resolve({ id: key.length, name: key, parentAccount: null }),
    ),
    findBySystemKey: jest.fn((key: string) =>
      Promise.resolve({
        id: key.length,
        name: key,
        parentAccount: { name: 'المصروفات التشغيلية' },
      }),
    ),
  };
  const transactionService = { save: jest.fn() };

  const service = new PolicyLedgerService(
    policyRepo as never,
    journeyRepo as never,
    jtRepo as never,
    {} as never,
    {} as never,
    txRepo as never,
    custodyRepo as never,
    accountService as never,
    transactionService as never,
  );
  return { service, jtRepo, transactionService };
}

const companyRows = [
  { id: 1, category: JourneyTransactionCategoryType.CUSTODY, amount: 500 },
  { id: 2, category: JourneyTransactionCategoryType.DIESEL_FEES, amount: '300.00' },
  { id: 3, category: JourneyTransactionCategoryType.TIPS_FEES, amount: 20 },
];

describe('PolicyLedgerService TRN3', () => {
  it('settles each company-car expense type from the driver custody', async () => {
    const { service } = build({ rows: companyRows });
    const preview = await service.preview(5);

    const trn3 = preview.lines.filter((line) => line.kind === 'TRN3');
    expect(trn3).toEqual([
      expect.objectContaining({
        category: JourneyTransactionCategoryType.DIESEL_FEES,
        amount: 300,
        debitPath: 'المصروفات التشغيلية → TRIP_EXP_DIESEL',
        creditPath: 'عهد → سائق 1',
      }),
      expect.objectContaining({
        category: JourneyTransactionCategoryType.TIPS_FEES,
        amount: 20,
        debitPath: 'المصروفات التشغيلية → TRIP_EXP_TIPS',
      }),
    ]);
    expect(preview.lines.map((line) => line.kind)).toContain('TRN1');
    expect(preview.warnings).toEqual([]);
  });

  it('posts one balanced transaction per expense type with its own idempotency key', async () => {
    const { service, transactionService } = build({ rows: companyRows });
    await service.apply(5, {});

    const keys = transactionService.save.mock.calls.map(([tx]) => tx.idempotencyKey);
    expect(keys).toEqual([
      'policy:10:journey:5:TRN1',
      'policy:10:journey:5:TRN3:Diesel Fees',
      'policy:10:journey:5:TRN3:Tips Fees',
    ]);
    for (const [tx] of transactionService.save.mock.calls) {
      const [debit, credit] = tx.transactionLines;
      expect(debit.amount).toBe(credit.amount);
    }
  });

  it('skips expense types that are already posted', async () => {
    const { service, transactionService } = build({
      rows: companyRows,
      posted: [JourneyTransactionCategoryType.DIESEL_FEES],
    });
    await service.apply(5, {});

    const keys = transactionService.save.mock.calls.map(([tx]) => tx.idempotencyKey);
    expect(keys).not.toContain('policy:10:journey:5:TRN3:Diesel Fees');
    expect(keys).toContain('policy:10:journey:5:TRN3:Tips Fees');
  });

  it('posts no TRN3 for a nolon car', async () => {
    const { service } = build({ ownerShip: OwnerShipType.NOLON_CAR, rows: companyRows });
    const preview = await service.preview(5);
    expect(preview.lines.some((line) => line.kind === 'TRN3')).toBe(false);
  });

  it('warns and skips TRN3 when the trip has no driver custody', async () => {
    const { service } = build({ rows: companyRows, custody: null });
    const preview = await service.preview(5);
    expect(preview.lines.some((line) => line.kind === 'TRN3')).toBe(false);
    expect(preview.warnings).toContain('لا توجد عهدة سائق للرحلة.');
  });

  it('warns when expenses exceed the custody', async () => {
    const { service } = build({
      rows: [
        { id: 1, category: JourneyTransactionCategoryType.CUSTODY, amount: 100 },
        { id: 2, category: JourneyTransactionCategoryType.DIESEL_FEES, amount: 300 },
      ],
    });
    const preview = await service.preview(5);
    expect(preview.warnings).toContain('مصروفات الرحلة أكبر من العهدة.');
  });
});

describe('PolicyLedgerService.saveExpenses', () => {
  it('upserts the four expense types for a company car', async () => {
    const { service, jtRepo } = build({ rows: [] });
    await service.saveExpenses(5, {
      dieselFees: 300,
      fuelLiters: 40,
      cardFees: 50,
      cardName: 'كارته السويس',
      scaleFees: 30,
      tipsFees: 20,
    });

    const saved = jtRepo.save.mock.calls.map(([row]) => [row.category, row.amount]);
    expect(saved).toEqual([
      [JourneyTransactionCategoryType.DIESEL_FEES, 300],
      [JourneyTransactionCategoryType.CARD_FEES, 50],
      [JourneyTransactionCategoryType.SCALE_FEES, 30],
      [JourneyTransactionCategoryType.TIPS_FEES, 20],
    ]);
    expect(jtRepo.save.mock.calls[0][0].quantity).toBe(40);
    expect(jtRepo.save.mock.calls[1][0].description).toBe('كارته السويس');
  });

  it('ignores expenses on a nolon car', async () => {
    const { service, jtRepo } = build({ ownerShip: OwnerShipType.NOLON_CAR });
    await service.saveExpenses(5, { dieselFees: 300 });
    expect(jtRepo.save).not.toHaveBeenCalled();
  });

  it('rejects changing a posted expense', async () => {
    const { service } = build({
      rows: companyRows,
      posted: [JourneyTransactionCategoryType.DIESEL_FEES],
    });
    await expect(service.saveExpenses(5, { dieselFees: 250 })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('accepts the same amount for a posted expense', async () => {
    const { service, jtRepo } = build({
      rows: companyRows,
      posted: [JourneyTransactionCategoryType.DIESEL_FEES],
    });
    await service.saveExpenses(5, { dieselFees: 300 });
    expect(jtRepo.save).not.toHaveBeenCalled();
  });

  it('removes an unposted expense cleared to zero', async () => {
    const { service, jtRepo } = build({ rows: companyRows });
    await service.saveExpenses(5, { tipsFees: 0 });
    expect(jtRepo.delete).toHaveBeenCalledWith(3);
  });
});
