import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { LocalizedExceptionFilter } from './i18n/localized-exception.filter';
import { createLocalizedValidationPipe } from './i18n/localized-validation.pipe';

const PORT = process.env.PORT || 4040;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(createLocalizedValidationPipe());
  app.useGlobalFilters(app.get(LocalizedExceptionFilter));

  app.enableCors({
    exposedHeaders: ['X-Total-Count', 'Custom-Header'],
  });

  await app.listen(PORT);
}
bootstrap()
  .then(() => {
    console.info(`Application is running on Port::${PORT}`);
  })
  .catch((error) => {
    console.error('Error during application bootstrap:', error);
  });
