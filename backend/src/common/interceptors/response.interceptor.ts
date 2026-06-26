import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ApiResponseDto } from '../dto/api-response.dto';
import { map, Observable } from 'rxjs';
import { Response } from 'express';

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponseDto<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponseDto<T>> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        return new ApiResponseDto(
          true,
          'success',
          data,
          undefined,
          response.statusCode,
        );
      }),
    );
  }
}
