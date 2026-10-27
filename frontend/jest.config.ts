const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Floor of the current suite (imported files only), rounded down.
  coverageThreshold: {
    global: {
      statements: 74,
      branches: 62,
      functions: 67,
      lines: 75,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
