import _storybook from 'eslint-plugin-storybook';
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettierConfig,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
  {
    rules: {
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'react/jsx-key': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'prefer-const': 'warn',
      'no-var': 'error',
      'prefer-arrow-callback': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      'max-lines': ['error', { max: 250, skipBlankLines: true, skipComments: true }],
      complexity: ['warn', 10],
      'func-style': ['error', 'expression', { allowArrowFunctions: true }],
      'arrow-body-style': ['error', 'as-needed'],
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'arrow-function',
          unnamedComponents: 'arrow-function',
        },
      ],
    },
  },
]);

export default eslintConfig;
