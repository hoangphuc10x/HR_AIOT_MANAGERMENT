import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import react from "eslint-plugin-react";

export default [
    // Ignore config
    {
        ignores: [
            'node_modules/**',
            'dist/**',
            'build/**',
            'coverage/**',
            'frontend/.next/**',
            '*.config.js',
            '*.config.mjs',
            '*.config.ts',
        ],
    },

    // Global base config
    {
        files: ['**/*.{js,mjs,cjs,ts,tsx}'],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: 2021,
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                console: 'readonly',
                process: 'readonly',
                Buffer: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                module: 'readonly',
                require: 'readonly',
                exports: 'readonly',
                global: 'readonly',
                window: 'readonly',
                document: 'readonly',
                navigator: 'readonly',
                HTMLInputElement: 'readonly',
                HTMLTextAreaElement: 'readonly',
                HTMLElement: 'readonly',
                HTMLSelectElement: 'readonly',
                localStorage: 'readonly',
                sessionStorage: 'readonly',
                fetch: 'readonly',
                alert: 'readonly',
                confirm: 'readonly',
                performance: 'readonly',
                PerformanceNavigationTiming: 'readonly',
                React: 'readonly',
                JSX: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                describe: 'readonly',
                it: 'readonly',
                expect: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                jest: 'readonly',
                test: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': typescript,
            prettier: prettierPlugin,
            react,
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            // ESLint base + TypeScript + Prettier
            ...js.configs.recommended.rules,
            ...typescript.configs.recommended.rules,
            ...prettierConfig.rules,

            // Prettier
            'prettier/prettier': [
                'error',
                {
                    semi: true,
                    tabWidth: 2,
                    singleQuote: true,
                    trailingComma: 'all',
                    printWidth: 80,
                    endOfLine: 'auto',
                },
            ],

            // TS strictness
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-namespace': 'off',

            // Formatting + indentation
            indent: 'off',
            '@typescript-eslint/indent': 'off',

            // React
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
        },
    },

    // Frontend-specific
    {
        files: ['frontend/**/*.{ts,tsx}'],
        languageOptions: {
            globals: {
                React: 'readonly',
                JSX: 'readonly',
                HTMLDivElement: 'readonly',
                HTMLButtonElement: 'readonly',
                MouseEvent: 'readonly',
                Node: 'readonly',
                Event: 'readonly',
                EventTarget: 'readonly',
                Element: 'readonly',
                HTMLElement: 'readonly',
                KeyboardEvent: 'readonly',
                File: 'readonly',
                FormData: 'readonly',
                URL: 'readonly',
                URLSearchParams: 'readonly',
            },
        },
        rules: {
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
        },
    },

    // Backend-specific
    {
        files: ['backend/**/*.{ts,js}'],
        languageOptions: {
            globals: {
                process: 'readonly',
                Buffer: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
            },
        },
        rules: {
            'no-console': 'off',
        },
    },
];
