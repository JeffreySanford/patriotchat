const path = require('path');

module.exports = {
  displayName: 'shared',
  preset: path.join(__dirname, 'jest-preset'),
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/shared',
};
