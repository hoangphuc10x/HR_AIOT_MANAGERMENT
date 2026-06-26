import React, { forwardRef, ChangeEvent } from 'react';

type InputTextProps = {
  name: string;
  value?: string;
  readOnly?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
};

export const InputText = forwardRef<HTMLInputElement, InputTextProps>(
  (
    {
      name,
      value,
      readOnly = false,
      onChange,
      type = 'text',
      placeholder,
      maxLength,
      required = false,
    },
    ref,
  ) => {
    const inputProps: React.InputHTMLAttributes<HTMLInputElement> = {
      className:
        'w-full px-3 py-2 rounded bg-white text-black border border-gray-300 focus:outline-none',
      name,
      readOnly,
      type,
      placeholder,
      maxLength,
      required,
    };

    if (onChange) {
      inputProps.value = value ?? '';
      inputProps.onChange = onChange;
    } else {
      inputProps.defaultValue = value;
    }

    return <input ref={ref} {...inputProps} />;
  },
);

InputText.displayName = 'InputText';
