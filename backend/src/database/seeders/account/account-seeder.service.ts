import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from 'src/app/modules/account/account.entity';
import { generateUniqueCode } from 'src/core/utils/generator';
import { GeneratorTypes } from 'src/core/enums/generator-types';
import { accounts } from './data';

@Injectable()
export class AccountSeederService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async create(): Promise<(Account | null)[]> {
    const results: (Account | null)[] = [];
    // name → saved entity so children can reference parents by name
    const savedByName = new Map<string, Account>();

    // Pre-populate map with every account already in the DB
    const existingAll = await this.accountRepository.find({ relations: ['parentAccount'] });
    for (const acc of existingAll) {
      savedByName.set(acc.name, acc);
    }

    for (const seed of accounts) {
      let account = savedByName.get(seed.name);

      if (!account) {
        const code = await generateUniqueCode(
          this.accountRepository,
          GeneratorTypes.ACCOUNT,
          'code',
        );

        account = this.accountRepository.create({
          name: seed.name,
          type: seed.type,
          normalBalance: seed.normalBalance,
          isLeaf: seed.isLeaf,
          isSystem: true,
          code,
          createdBy: 'system',
          updatedBy: 'system',
          openingBalance: seed.openingBalance ?? 0,
          openingBalanceLocked: typeof seed.openingBalance === 'number',
        });
      } else {
        // Repair isLeaf flag on re-seed
        account.isLeaf = seed.isLeaf;
        account.isSystem = true;
        if (typeof seed.openingBalance === 'number') {
          account.openingBalance = seed.openingBalance;
          account.openingBalanceLocked = true;
        }
      }

      // Set / repair parent relationship
      if (seed.parentName) {
        const parent = savedByName.get(seed.parentName);
        if (parent) {
          if (!account.parentAccount || account.parentAccount.id !== parent.id) {
            account.parentAccount = parent;
          }
        } else {
          console.warn(`[AccountSeeder] Parent "${seed.parentName}" not found for "${seed.name}"`);
        }
      }

      const saved = await this.accountRepository.save(account);
      savedByName.set(saved.name, saved);
      results.push(saved);
    }

    // Ensure every account that has children in the seed is marked as non-leaf
    // (reconciliation step in case data gets out of sync)
    await this.reconcileLeafFlags();

    return results;
  }

  /**
   * Walk every account that appears as a parentAccount and force isLeaf = false.
   * Walk every account that has NO children and force isLeaf = true.
   */
  private async reconcileLeafFlags(): Promise<void> {
    const all = await this.accountRepository.find({ relations: ['childAccounts'] });

    const toUpdate: Account[] = [];
    for (const acc of all) {
      const hasChildren = acc.childAccounts && acc.childAccounts.length > 0;
      const expectedLeaf = !hasChildren;

      if (acc.isLeaf !== expectedLeaf) {
        acc.isLeaf = expectedLeaf;
        toUpdate.push(acc);
      }
    }

    if (toUpdate.length > 0) {
      await this.accountRepository.save(toUpdate);
      console.log(`[AccountSeeder] Reconciled isLeaf for ${toUpdate.length} account(s)`);
    }
  }
}
