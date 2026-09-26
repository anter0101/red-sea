/**
 * Integration smoke test for person sub-account provisioning.
 * Run: pnpm exec ts-node -r tsconfig-paths/register scripts/verify-person-accounts.ts
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app/app.module';
import { AccountService } from '../src/app/modules/account/account.service';
import {
  ACCOUNT_PARENT_CUSTODY,
  ACCOUNT_PARENT_LOAN,
  ACCOUNT_PARENT_SALARIES,
  PERSON_ACCOUNT_PARENTS,
} from '../src/app/modules/account/person-account.constants';
import { UserRole } from '../src/core/enums/user-role';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Account } from '../src/app/modules/account/account.entity';
import { Repository } from 'typeorm';

const TEST_PERSON = `Test Person ${Date.now()}`;

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const accountService = app.get(AccountService);
  const accountRepo = app.get<Repository<Account>>(getRepositoryToken(Account));

  const parents = [ACCOUNT_PARENT_CUSTODY, ACCOUNT_PARENT_LOAN, ACCOUNT_PARENT_SALARIES];
  for (const name of parents) {
    const parent = await accountRepo.findOne({ where: { name } });
    if (!parent) {
      throw new Error(`Missing seeded parent account: ${name}`);
    }
    console.log(`OK parent exists: ${name} (id=${parent.id})`);
  }

  const rawatib = await accountRepo.findOne({ where: { name: ACCOUNT_PARENT_SALARIES } });
  if (!rawatib) {
    throw new Error('رواتب parent account missing — run pnpm run seed');
  }
  console.log(`OK رواتب seeded (id=${rawatib.id})`);

  const employeeParents = PERSON_ACCOUNT_PARENTS[UserRole.DATA_ENTRY]!;
  const created = await accountService.createPersonSubAccounts(TEST_PERSON, employeeParents, 'verify-script');
  console.log(`OK created ${created.length} sub-accounts for "${TEST_PERSON}"`);

  for (const parentName of employeeParents) {
    const found = await accountService.findPersonSubAccount(TEST_PERSON, parentName);
    console.log(`OK findPersonSubAccount: ${parentName} → id=${found.id}, code=${found.code}`);
  }

  const again = await accountService.createPersonSubAccounts(TEST_PERSON, employeeParents, 'verify-script');
  if (again.length !== employeeParents.length) {
    throw new Error('Idempotent re-create returned unexpected count');
  }
  console.log('OK idempotent re-create skipped duplicates');

  for (const child of created) {
    await accountRepo.delete(child.id);
  }
  console.log('OK cleaned up test sub-accounts');

  await app.close();
  console.log('\nAll person-account integration checks passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
