import type { Config } from 'jest';

const config: Config = {
    verbose: true,
    preset: 'ts-jest',
    testPathIgnorePatterns: ['/node_modules/'],
    testMatch: ['**/*.test.ts'],
    collectCoverage: true,
    coverageDirectory: '.coverage',
};

export default config;
