import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform {
  constructor(private readonly options?: { transform?: boolean }) {}

  async transform(value: any, { metatype }: ArgumentMetadata): Promise<any> {
    if (!metatype || !this.shouldValidate(metatype)) {
      return this.options?.transform
        ? this.transformPrimitive(value, metatype)
        : value;
    }

    const object = plainToInstance(
      metatype as new (...args: any[]) => any,
      value,
    );
    const errors = await validate(object);
    if (errors.length > 0) {
      const errorMessage = errors.flatMap((e) =>
        Object.values(e.constraints ?? {}),
      );
      throw new BadRequestException(errorMessage.join(', '));
    }

    return object;
  }

  private shouldValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private transformPrimitive(value: any, metatype: Function | undefined): any {
    if (!metatype) return value;

    switch (metatype) {
      case String:
        return String(value);
      case Number:
        return Number(value);
      case Boolean:
        return value === 'true' || value === true;
      default:
        return value;
    }
  }
}
