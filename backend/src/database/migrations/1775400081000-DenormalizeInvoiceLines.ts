import { MigrationInterface, QueryRunner } from 'typeorm';

export class DenormalizeInvoiceLines1775400081000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "invoices"
        ADD COLUMN IF NOT EXISTS "client_name" varchar(255),
        ADD COLUMN IF NOT EXISTS "company_name" varchar(255),
        ADD COLUMN IF NOT EXISTS "tax_card" varchar(50),
        ADD COLUMN IF NOT EXISTS "commercial_register" varchar(50)
    `);
    await queryRunner.query(`
      ALTER TABLE "invoice_journeys"
        ADD COLUMN IF NOT EXISTS "governorate" varchar(255),
        ADD COLUMN IF NOT EXISTS "received_company" varchar(255),
        ADD COLUMN IF NOT EXISTS "packing_type" varchar(50),
        ADD COLUMN IF NOT EXISTS "destination" varchar(255),
        ADD COLUMN IF NOT EXISTS "journey_date" date,
        ADD COLUMN IF NOT EXISTS "quantity" numeric(14,4),
        ADD COLUMN IF NOT EXISTS "unit_price" numeric(14,2)
    `);

    await queryRunner.query(`
      UPDATE invoices AS invoice
      SET client_name = client.name
      FROM clients AS client
      WHERE invoice.client_id = client.id
        AND invoice.client_name IS NULL
    `);
    await queryRunner.query(`
      UPDATE invoices
      SET company_name = settings.name,
          tax_card = settings.tax_card,
          commercial_register = settings.commercial_register
      FROM (
        SELECT name, tax_card, commercial_register
        FROM company_settings
        ORDER BY id ASC
        LIMIT 1
      ) AS settings
      WHERE invoices.company_name IS NULL
    `);
    await queryRunner.query(`
      UPDATE invoice_journeys AS line
      SET governorate = COALESCE(journey_gov.name, policy_gov.name),
          received_company = journey."receivedCompany",
          packing_type = journey."packingType",
          destination = COALESCE(journey_area.name, policy_area.name, journey.direction),
          journey_date = COALESCE(policy."tripDate", policy."loadingDate", journey."delegateDate"),
          quantity = journey.quantity,
          unit_price = CASE
            WHEN journey.quantity > 0 AND journey."expectedRevenue" > 0
              THEN ROUND((journey."expectedRevenue" / journey.quantity)::numeric, 2)
            WHEN journey.quantity > 0
              THEN ROUND((line.revenue_amount / journey.quantity)::numeric, 2)
            ELSE line.revenue_amount
          END
      FROM journeys AS journey
      LEFT JOIN governments AS journey_gov ON journey_gov.id = journey.delivery_gov_id
      LEFT JOIN areas AS journey_area ON journey_area.id = journey.delivery_area_id
      LEFT JOIN LATERAL (
        SELECT policy."tripDate", policy."loadingDate", policy.delivery_gov_id, policy.delivery_area_id
        FROM journey_policies AS policy
        WHERE policy.journey_id = journey.id
          AND policy.deleted_at IS NULL
        ORDER BY policy.id DESC
        LIMIT 1
      ) AS policy ON true
      LEFT JOIN governments AS policy_gov ON policy_gov.id = policy.delivery_gov_id
      LEFT JOIN areas AS policy_area ON policy_area.id = policy.delivery_area_id
      WHERE line.journey_id = journey.id
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('invoice_journeys', 'unit_price');
    await queryRunner.dropColumn('invoice_journeys', 'quantity');
    await queryRunner.dropColumn('invoice_journeys', 'journey_date');
    await queryRunner.dropColumn('invoice_journeys', 'destination');
    await queryRunner.dropColumn('invoice_journeys', 'packing_type');
    await queryRunner.dropColumn('invoice_journeys', 'received_company');
    await queryRunner.dropColumn('invoice_journeys', 'governorate');
    await queryRunner.dropColumn('invoices', 'commercial_register');
    await queryRunner.dropColumn('invoices', 'tax_card');
    await queryRunner.dropColumn('invoices', 'company_name');
    await queryRunner.dropColumn('invoices', 'client_name');
  }
}
