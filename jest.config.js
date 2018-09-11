var testConfig;
switch (process.env.FILE_SOURCE) {
  case 'lib':
    testConfig = {
      source: 'build/lib',
      collectCoverage: false,
    };
    break;
  case 'module':
    testConfig = {
      source: 'build/module',
      collectCoverage: false,
    };
    break;
  default:
    testConfig = {
      source: 'src',
      collectCoverage: true,
    };
    break;
}

module.exports = {
  automock: false,
  verbose: true,
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  globals: {
    _FILE_SOURCE_: testConfig.source,
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',
    '!src/scripts/build.ts',
    '!src/scripts/start.ts',
  ],
  coveragePathIgnorePatterns: ['/node_modules/', '/test/'],
  collectCoverage: testConfig.collectCoverage,
  moduleNameMapper: {
    '^~src(.*)$': '<rootDir>/' + testConfig.source + '$1',
  },
};
