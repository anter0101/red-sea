import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

interface ErrorPattern {
  regex: string;
  ar: string;
  entityGroups?: number[];
}

interface ErrorsCatalog {
  exact: Record<string, string>;
  entities: Record<string, string>;
  patterns: ErrorPattern[];
}

@Injectable()
export class ErrorTranslatorService implements OnModuleInit {
  private catalog!: ErrorsCatalog;
  private compiledPatterns: Array<{
    re: RegExp;
    ar: string;
    entityGroups: number[];
  }> = [];

  onModuleInit(): void {
    const filePath = path.join(__dirname, 'locales', 'errors.json');
    const raw = fs.readFileSync(filePath, 'utf8');
    this.catalog = JSON.parse(raw) as ErrorsCatalog;
    this.compiledPatterns = this.catalog.patterns.map((p) => ({
      re: new RegExp(p.regex),
      ar: p.ar,
      entityGroups: p.entityGroups ?? [],
    }));
  }

  resolveLocale(acceptLanguage?: string | string[]): 'ar' | 'en' {
    if (!acceptLanguage) return 'ar';
    const header = Array.isArray(acceptLanguage) ? acceptLanguage.join(',') : acceptLanguage;
    const primary = header.split(',')[0]?.trim().toLowerCase() ?? '';
    if (!primary) return 'ar';
    if (primary.startsWith('en')) return 'en';
    return 'ar';
  }

  translate(message: string, locale: 'ar' | 'en'): string {
    if (!message || locale === 'en') return message;

    const trimmed = message.trim();
    const exact = this.catalog.exact[trimmed];
    if (exact) return exact;

    for (const pattern of this.compiledPatterns) {
      const match = pattern.re.exec(trimmed);
      if (!match) continue;

      let result = pattern.ar;
      for (let i = 1; i < match.length; i++) {
        let value = match[i] ?? '';
        if (pattern.entityGroups.includes(i)) {
          value = this.catalog.entities[value] ?? value;
        }
        result = result.replace(new RegExp(`\\{\\{entity${i}\\}\\}`, 'g'), value);
        result = result.replace(new RegExp(`\\{\\{${i}\\}\\}`, 'g'), value);
      }
      return result;
    }

    const propertyConstraint = this.tryTranslatePropertyConstraint(trimmed);
    if (propertyConstraint) return propertyConstraint;

    return message;
  }

  /** class-validator: "vehicleMode should not be empty" → "vehicleMode يجب ألا يكون فارغاً" */
  private tryTranslatePropertyConstraint(message: string): string | undefined {
    const suffixes = Object.keys(this.catalog.exact)
      .filter((key) => key.startsWith('must ') || key.startsWith('should '))
      .sort((a, b) => b.length - a.length);

    for (const suffix of suffixes) {
      const needle = ` ${suffix}`;
      if (!message.endsWith(needle)) continue;

      const property = message.slice(0, message.length - needle.length);
      if (!property) continue;

      return `${property} ${this.catalog.exact[suffix]}`;
    }

    return undefined;
  }

  translateMany(messages: string[], locale: 'ar' | 'en'): string[] {
    return messages.map((m) => this.translate(m, locale));
  }
}
