import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/require-default-props': 'off',
      'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
      'react-hooks/exhaustive-deps': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-var': 'error',
      'spaced-comment': ['warn', 'always'],
      'prefer-const': 'error',
      'no-invalid-this': 'off',
      'default-case': 'warn',
      'react/no-unknown-property': ['error', { ignore: ['jsx', 'global'] }],
      '@typescript-eslint/consistent-type-imports': 'warn',
      curly: ['warn', 'all'],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      'react/no-unescaped-entities': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/static-components': 'warn',
      'react-hooks/incompatible-library': 'warn',
      'no-magic-numbers': [
        'warn',
        { ignore: [0, 1], ignoreArrayIndexes: true, enforceConst: true },
      ],
      'simple-import-sort/exports': 'warn',
      'simple-import-sort/imports': [
        'warn',
        {
          groups: [
            ['^react$', '^next', '^[a-z]', '^enums', '^hooks', '^utils/icons', '^utils', '^types'],
            ['^@'],
            ['^~'],
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            ['^.+\\.s?css$'],
            ['^\\u0000'],
          ],
        },
      ],
    },
  },
  {
    files: ['store/slices/**/*.ts'],
    rules: { 'no-param-reassign': ['error', { props: false }] },
  },
];

export default eslintConfig;
