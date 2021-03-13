module.exports = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/test-helper.ts'],
  moduleDirectories: ['node_modules', 'src'],
  moduleFileExtensions: ['ts', 'js'],
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  moduleNameMapper: { '@app/(.*)': '<rootDir>/src/$1' },
  testEnvironment: 'node',
  testMatch: ['<rootDir>/__tests__/**/?(*.)(test).(js|ts)'],
  preset: 'ts-jest',
};
