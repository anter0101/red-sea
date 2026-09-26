import { Injectable } from '@nestjs/common';
import { DriverService } from 'src/app/modules/driver/driver.service';
import { ContactService } from 'src/app/modules/contact/contact.service';
import { mapUserCreateDtoToEntity } from 'src/app/modules/user/user.mapper';
import { mapCreateContactDtoToEntity } from 'src/app/modules/contact/contact.mapper';
import { UserRole } from 'src/core/enums/user-role';
import { Contact } from 'src/app/modules/contact/contact.entity';
import { Driver } from 'src/app/modules/driver/driver.entity';
import { drivers } from './data';

@Injectable()
export class DriverSeederService {
  constructor(
    private readonly driverService: DriverService,
    private readonly contactService: ContactService,
  ) {}

  async create(): Promise<(Driver | null)[]> {
    const results: (Driver | null)[] = [];

    for (const data of drivers) {
      const existing = await this.driverService.findByFields({
        where: { licenseNumber: data.licenseNumber },
      });

      if (existing) {
        results.push(null);
        continue;
      }

      const entity = new Driver();
      entity.licenseNumber = data.licenseNumber;
      entity.licenseExpiryDate = new Date(data.licenseExpiryDate);
      entity.user = await mapUserCreateDtoToEntity({
        email: data.user.email,
        username: '',
        password: data.user.password,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        status: data.user.status,
        role: UserRole.DRIVER,
        contacts: [],
      });
      entity.user.role = UserRole.DRIVER;

      const saved = await this.driverService.save(entity, 'system');

      if (data.contacts?.length) {
        const mappedContacts = mapCreateContactDtoToEntity(
          data.contacts.map((contact) => ({ ...contact, userId: saved.user.id })),
        ) as Contact[];
        await this.contactService.save(mappedContacts, 'system');
      }

      results.push(saved);
    }

    return results;
  }
}
