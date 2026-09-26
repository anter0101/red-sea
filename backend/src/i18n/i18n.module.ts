import { Global, Module } from '@nestjs/common';

import { ErrorTranslatorService } from './error-translator.service';
import { LocalizedExceptionFilter } from './localized-exception.filter';

@Global()
@Module({
  providers: [ErrorTranslatorService, LocalizedExceptionFilter],
  exports: [ErrorTranslatorService, LocalizedExceptionFilter],
})
export class I18nModule {}
