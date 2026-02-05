import nx from '@nx/eslint-plugin';
// import vitestPlugin from 'eslint-plugin-vitest';
import testingLibraryPlugin from 'eslint-plugin-testing-library';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/dist',
      '**/out-tsc',
      '**/.angular',
      '**/node_modules',
      '**/coverage',
    ],
  },
  // Vitest & Testing Library Configuration for Test Files
  {
    files: ['**/*.spec.ts', '**/*.spec.tsx'],
    plugins: {
      // vitest: vitestPlugin,
      'testing-library': testingLibraryPlugin,
    },
    languageOptions: {
      globals: {
        expect: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
      },
    },
    rules: {
      // 'vitest/no-disabled-tests': 'warn',
      // 'vitest/no-focused-tests': 'warn',
      // 'vitest/prefer-to-be-truthy': 'error',
      // 'vitest/prefer-to-be-falsy': 'error',
      'testing-library/prefer-screen-queries': 'warn',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    // Enterprise enforcement rules
    rules: {
      // Disallow Angular Signals imports from @angular/core
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@angular/core',
              importNames: [
                'signal',
                'computed',
                'effect',
                'Signal',
                'WritableSignal',
                'injectSignal',
              ],
              message:
                'Angular Signals are forbidden in this workspace; use RxJS Observables instead.',
            },
          ],
        },
      ],

      // Disallow standalone components, Promise creation/then usage, and Promise type references
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Property[key.name="standalone"][value.value=true]',
          message:
            'Standalone components are forbidden. Declare components in NgModules and set standalone: false.',
        },
        {
          selector: 'NewExpression[callee.name="Promise"]',
          message:
            'Creating Promises directly is forbidden. Use Observables or adapter patterns instead.',
        },
        {
          selector: 'CallExpression[callee.property.name="then"]',
          message:
            'Using .then indicates Promise usage; convert to an Observable instead.',
        },
        {
          selector: 'TSTypeReference[typeName.name="Promise"]',
          message:
            'Use Observable types instead of Promise in services and controllers.',
        },
      ],
    },
  },
  // Strict typing enforcement requiring explicit types and banning `any`/`unknown`
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: [
          './tsconfig.base.json',
          'apps/frontend/tsconfig.json',
          'apps/frontend/tsconfig.app.json',
        ],
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/typedef': [
        'error',
        {
          arrayDestructuring: false,
          arrowParameter: true,
          memberVariableDeclaration: true,
          objectDestructuring: false,
          parameter: true,
          propertyDeclaration: true,
          variableDeclaration: true,
        },
      ],
      // Typed rules (require parserOptions.project)
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-return': 'warn',
      '@typescript-eslint/no-misused-promises': [
        'warn',
        { checksVoidReturn: false },
      ],
      '@typescript-eslint/no-inferrable-types': 'off',

      // Disallow explicit `any` and `unknown` as syntax nodes; provide clear messages
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSAnyKeyword',
          message:
            'Use explicit types or shared DTOs from @patriotchat/shared instead of any.',
        },
        {
          selector: 'TSUnknownKeyword',
          message:
            'Avoid unknown; provide concrete types with proper error classes/interfaces instead.',
        },
        {
          selector: 'TSTypeReference[typeName.name="any"]',
          message: 'Use explicit types instead of `any`.',
        },
        {
          selector: 'TSTypeReference[typeName.name="unknown"]',
          message: 'Avoid `unknown`; provide concrete types instead.',
        },
      ],
    },
  },
  // Test files: relax strict 'no-unsafe-*' rules to allow idiomatic testing patterns while maintaining typedefs
  {
    files: [
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/*.vitest.ts',
      '**/*-e2e/**',
      '**/api-e2e/**',
    ],
    rules: {
      '@typescript-eslint/typedef': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-restricted-syntax': 'off',
    },
  },
];
