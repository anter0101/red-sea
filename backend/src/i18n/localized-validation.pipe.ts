import { ValidationPipe, ValidationPipeOptions } from '@nestjs/common';

const DEFAULT_OPTIONS: ValidationPipeOptions = {
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: false,
};

/**
 * Global ValidationPipe — DTO errors are English keys/messages resolved via
 * {@link ErrorTranslatorService} in {@link LocalizedExceptionFilter} (Accept-Language).
 */
export function createLocalizedValidationPipe(
  overrides: ValidationPipeOptions = {},
): ValidationPipe {
  return new ValidationPipe({ ...DEFAULT_OPTIONS, ...overrides });
}
