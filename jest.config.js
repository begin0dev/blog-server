module.exports = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
  ],
  moduleDirectories: [
    'node_modules',
    'src',
  ],
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/tests/**/?(*.)(spec|test).(j|t)s?(x)',
    '<rootDir>/__tests__/**/?(*.)(spec|test).(j|t)s?(x)',
  ],
};
