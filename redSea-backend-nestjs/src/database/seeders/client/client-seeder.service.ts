import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from 'src/app/modules/factory/client.entity';

@Injectable()
export class ClientSeederService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async create(): Promise<(Client | null)[]> {
    const clientsToSeed: Array<Partial<Client> & { id: number }> = [
      {
        id: 1,
        name: 'مصنع اسمنت العريش',
        commercialRecord: 'CR-ARISH',
        companyCode: 'C-ARISH',
        taxInvoice: undefined,
        destinationsFile: undefined,
      },
      {
        id: 2,
        name: 'مصنع وطنيه',
        commercialRecord: 'CR-WATANIA',
        companyCode: 'C-WATANIA',
        taxInvoice: undefined,
        destinationsFile: undefined,
      },
    ];

    const results: (Client | null)[] = [];

    for (const data of clientsToSeed) {
      // Prefer checking by id to satisfy explicit id requirement
      const existingById = await this.clientRepository.findOne({ where: { id: data.id } });
      if (existingById) {
        // Optionally ensure name and fields are aligned
        const needsUpdate =
          existingById.name !== data.name ||
          existingById.commercialRecord !== data.commercialRecord ||
          existingById.companyCode !== data.companyCode;

        if (needsUpdate) {
          existingById.name = data.name as string;
          existingById.commercialRecord = data.commercialRecord as string;
          existingById.companyCode = data.companyCode as string;
          results.push(await this.clientRepository.save(existingById));
        } else {
          results.push(null);
        }
        continue;
      }

      // If not found by id, ensure we don't duplicate by name
      const existingByName = await this.clientRepository.findOne({
        where: { name: data.name as string },
      });
      if (existingByName) {
        // Keep existing; do not change primary id
        results.push(null);
        continue;
      }

      // Insert with explicit id value
      const client = this.clientRepository.create(data as Client);
      const saved = await this.clientRepository.save(client);
      results.push(saved);
    }

    return results;
  }
}
