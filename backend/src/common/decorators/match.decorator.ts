import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function Match(property: string, validationOptions?: ValidationOptions) {
  return function (object: Record<string, any>, propertyName: string) {
    registerDecorator({
      name: 'Match',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          return value === (args.object as any)[relatedPropertyName];
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must match ${args.constraints[0]}`;
        },
      },
    });
  };
}
