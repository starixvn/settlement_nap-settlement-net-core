module.exports = {
    preset: "jest-preset-angular",
    testResultsProcessor: 'jest-sonar-reporter',
    setupFilesAfterEnv: [
        "<rootDir>/setup.jest.ts"
      ],
      testPathIgnorePatterns: [
        "<rootDir>/node_modules"
      ],
      transform: {
        "^.+\\.(ts|js|mjs|html|svg)$": [
          "jest-preset-angular",
          {
            tsconfig: "<rootDir>/tsconfig.spec.json",
            stringifyContentPathRegex: "\\.(html|svg)$"
          }
        ]
      },
      collectCoverage: false,
      collectCoverageFrom: ['**/*.ts',],
      coveragePathIgnorePatterns: ['.spec.ts', '.module.ts', 'main.ts', 'model.ts', '.native.ts',
       'app-base.component.ts', 
       'app-table.component.ts',
       'esports.service.ts'
      ],
      coverageDirectory: 'reports/coverage',
      coverageReporters: ['html', ['lcovonly', { 'projectRoot': '../../' }]],
      testTimeout: 30000,
      maxWorkers: 1,
      verbose: true,
      detectOpenHandles: true,
      forceExit: true
}