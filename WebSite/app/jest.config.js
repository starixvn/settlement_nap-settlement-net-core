module.exports = {
    preset: "jest-preset-angular",
    testResultsProcessor: 'jest-sonar-reporter',
    setupFilesAfterEnv: [
        "<rootDir>/setup.jest.ts"
      ],
      testPathIgnorePatterns: [
        "<rootDir>/node_modules"
      ],
      globals: {
        "ts-jest": {
          "tsconfig": "<rootDir>/tsconfig.spec.json"
        }
      },
      collectCoverage: true,
      collectCoverageFrom: ['**/*.ts',],
      coveragePathIgnorePatterns: ['.spec.ts', '.module.ts', 'main.ts', 'model.ts', '.native.ts'],
      coverageDirectory: 'reports/coverage',
      coverageReporters: ['html', ['lcovonly', { 'projectRoot': '../../' }]],
}