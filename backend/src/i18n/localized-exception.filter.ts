import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

import { ErrorTranslatorService } from './error-translator.service';

const STATUS_ERROR_LABELS: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  500: 'Internal Server Error',
};

@Catch()
export class LocalizedExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(LocalizedExceptionFilter.name);

  constructor(private readonly errorTranslator: ErrorTranslatorService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();

      if (typeof body === 'string') {
        message = body;
      } else if (typeof body === 'object' && body !== null) {
        const record = body as Record<string, unknown>;
        if (record.message !== undefined) {
          message = record.message as string | string[];
        }
        if (typeof record.error === 'string') {
          error = record.error;
        }
      }
    } else if (exception instanceof QueryFailedError) {
      const pgCode = (exception as QueryFailedError & { driverError?: { code?: string } })
        .driverError?.code;

      if (pgCode === '23503') {
        const detail = exception.message.toLowerCase();
        status =
          detail.includes('delete') || detail.includes('update or delete')
            ? HttpStatus.CONFLICT
            : HttpStatus.BAD_REQUEST;
        message =
          status === HttpStatus.CONFLICT
            ? 'Cannot delete or update this record because it is referenced by other records'
            : 'Referenced record does not exist';
        error = STATUS_ERROR_LABELS[status] ?? error;
      } else if (pgCode === '23505') {
        status = HttpStatus.CONFLICT;
        message = this.resolveDuplicateKeyMessage(exception as QueryFailedError);
        error = STATUS_ERROR_LABELS[status];
      } else if (pgCode === '23502') {
        status = HttpStatus.BAD_REQUEST;
        message = 'Required field is missing';
        error = STATUS_ERROR_LABELS[status];
      } else {
        this.logger.error(exception.message, exception.stack);
      }
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    }

    if (exception instanceof HttpException && error === 'Internal Server Error') {
      error = STATUS_ERROR_LABELS[status] ?? error;
    }

    const locale = this.errorTranslator.resolveLocale(request.headers['accept-language']);
    const translated = Array.isArray(message)
      ? this.errorTranslator.translateMany(message.map(String), locale)
      : this.errorTranslator.translate(String(message), locale);

    response.status(status).json({
      statusCode: status,
      message: translated,
      error: this.errorTranslator.translate(error, locale),
    });
  }

  /** Map known unique-constraint violations to clearer API messages. */
  private resolveDuplicateKeyMessage(error: QueryFailedError): string {
    const detail = String(
      (error as QueryFailedError & { driverError?: { detail?: string; constraint?: string } })
        .driverError?.detail ?? error.message,
    ).toLowerCase();

    if (detail.includes('chassisnumber') || detail.includes('chassis_number')) {
      const match = detail.match(/=\(([^)]+)\)/);
      const value = match?.[1];
      return value
        ? `Trailer with chassis number ${value} already exists`
        : 'Trailer with this chassis number already exists';
    }

    if (detail.includes('platenum') || detail.includes('plate_letters')) {
      return 'Trailer with this plate already exists';
    }

    return 'Record already exists';
  }
}
