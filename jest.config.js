module.exports = {
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
    },
  },
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/test-helper.ts'],
  moduleDirectories: ['node_modules', 'src'],
  moduleFileExtensions: ['ts', 'js'],
  moduleNameMapper: {
    '@app/(.*)': '<rootDir>/src/$1',
  },
  testEnvironment: 'node',
  testMatch: ['<rootDir>/__tests__/**/?(*.)(spec|test).(js|ts)'],
  transform: {
    '^.+\\.(ts)$': 'ts-jest',
  },
};
