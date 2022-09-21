module.exports = {
    preset: 'jest-preset-angular',
    roots: ["<rootDir>"],
    setupFilesAfterEnv: ["<rootDir>/setup-jest.ts"],
    globals: {
        'ts-jest': {
            tsConfig: '<rootDir>/tsconfig.spec.json',
            stringifyContentPathRegex: '\\.html$',
            astTransformers: [require.resolve('jest-preset-angular/InlineHtmlStripStylesTransformer')]
        }
    },
    transform: {
        '^.+\\.(ts|js|html)$': 'ts-jest',
    },
    testPathIgnorePatterns: [
        "<rootDir>/test.ts"
    ]

};