import nx from '@nx/eslint-plugin';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist', '**/out-tsc'],
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
          'paths': [
            {
              'name': '@angular/core',
              'importNames': ['signal', 'computed', 'effect', 'Signal', 'WritableSignal', 'injectSignal'],
              'message': 'Angular Signals are forbidden in this workspace; use RxJS Observables instead.'
            }
          ]
        }
      ],

      // Disallow standalone components, Promise creation/then usage, and Promise type references
      'no-restricted-syntax': [
        'error',
        {
          'selector': 'Property[key.name="standalone"][value.value=true]',
          'message': 'Standalone components are forbidden. Declare components in NgModules and set standalone: false.'
        },
        {
          'selector': 'NewExpression[callee.name="Promise"]',
          'message': 'Creating Promises directly is forbidden. Use Observables or adapter patterns instead.'
        },
        {
          'selector': 'CallExpression[callee.property.name="then"]',
          'message': 'Using .then indicates Promise usage; convert to an Observable instead.'
        },
        {
          'selector': 'TSTypeReference[typeName.name="Promise"]',
          'message': 'Use Observable types instead of Promise in services and controllers.'
        }
      ],

    },
  },
  // Strict typing enforcement requiring explicit types and banning `any`/`unknown`
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.base.json', './frontend/tsconfig.json', './frontend/tsconfig.app.json', './libs/shared/tsconfig.lib.json']
      }
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/typedef': ['error', {
        'arrayDestructuring': false,
        'arrowParameter': true,
        'memberVariableDeclaration': true,
        'objectDestructuring': false,
        'parameter': true,
        'propertyDeclaration': true,
        'variableDeclaration': true
      }],
      // Typed rules (require parserOptions.project)
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-misused-promises': ['error', { 'checksVoidReturn': false }],
      '@typescript-eslint/no-inferrable-types': 'off',

      // Disallow explicit `any` and `unknown` as syntax nodes; provide clear messages
      'no-restricted-syntax': [
        'error',
        {
          'selector': 'TSAnyKeyword',
          'message': 'Use explicit types or shared DTOs from @patriotchat/shared instead of any.'
        },
        {
          'selector': 'TSUnknownKeyword',
          'message': 'Avoid unknown; prefer concrete types and DTOs.'
        },
        {
          'selector': 'TSTypeReference[typeName.name="any"]',
          'message': 'Use explicit types instead of `any`.'
        },
        {
          'selector': 'TSTypeReference[typeName.name="unknown"]',
          'message': 'Avoid `unknown`; provide concrete types instead.'
        }
      ]
    },
  },
  // Test files: relax strict 'no-unsafe-*' rules to allow idiomatic testing patterns while maintaining typedefs
  {
    files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.vitest.ts', 'frontend-e2e/**', 'api-e2e/**'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off'
    }
  }
];
