import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    languageOptions: {
      globals: {
        HTMLDivElement: 'readonly',
        HTMLButtonElement: 'readonly',
        MouseEvent: 'readonly',
        Node: 'readonly',
        Event: 'readonly',
        EventTarget: 'readonly',
        Element: 'readonly',
        HTMLElement: 'readonly',
        HTMLSelectElement: 'readonly',
        KeyboardEvent: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        File: 'readonly',
        FormData: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
      },
    },
  },
];

export default eslintConfig;
