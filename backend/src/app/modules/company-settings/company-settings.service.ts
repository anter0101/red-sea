import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanySettings } from './company-settings.entity';
import { UpdateCompanySettingsDTO } from './dtos/update-company-settings.dto';

export const DEFAULT_COMPANY_SETTINGS = {
  name: 'البحر الاحمر لتجارة الاسمنت',
  taxCard: '758-003-633',
  commercialRegister: '220842',
};

export interface CompanySettingsView {
  id: number;
  name: string;
  taxCard: string;
  commercialRegister: string;
}

@Injectable()
export class CompanySettingsService {
  constructor(
    @InjectRepository(CompanySettings)
    private readonly repository: Repository<CompanySettings>,
  ) {}

  async get(): Promise<CompanySettingsView> {
    const existing = await this.findRow();
    if (existing) return toView(existing);
    const created = await this.repository.save(this.repository.create(DEFAULT_COMPANY_SETTINGS));
    return toView(created);
  }

  async update(dto: UpdateCompanySettingsDTO, updater?: string): Promise<CompanySettingsView> {
    const existing = await this.findRow();
    const row = existing ?? this.repository.create(DEFAULT_COMPANY_SETTINGS);
    row.name = dto.name.trim();
    row.taxCard = dto.taxCard.trim();
    row.commercialRegister = dto.commercialRegister.trim();
    row.updatedAt = new Date();
    if (updater) row.updatedBy = updater;
    const saved = await this.repository.save(row);
    return toView(saved);
  }

  private async findRow(): Promise<CompanySettings | null> {
    const [row] = await this.repository.find({ order: { id: 'ASC' }, take: 1 });
    return row ?? null;
  }
}

function toView(row: CompanySettings): CompanySettingsView {
  return {
    id: row.id,
    name: row.name,
    taxCard: row.taxCard,
    commercialRegister: row.commercialRegister,
  };
}
