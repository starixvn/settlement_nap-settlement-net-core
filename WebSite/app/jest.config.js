module.exports = {
    preset: "jest-preset-angular",
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
      }
}