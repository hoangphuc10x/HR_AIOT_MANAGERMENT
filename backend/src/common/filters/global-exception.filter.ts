import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // validation when validate done it will be release by that message
      if (
        typeof exceptionResponse === 'object' &&
        (exceptionResponse as any).errors
      ) {
        return response.status(status).json(exceptionResponse);
      }

      return response.status(status).json({
        success: false,
        message: (exceptionResponse as any)?.message || 'Internal Server Error',
        statusCode: status,
        timeStamp: new Date().toISOString(),
      });
    }

    // If not HttpException
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Internal server error',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timeStamp: new Date().toISOString(),
    });
  }
}
