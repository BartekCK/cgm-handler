import type { Config } from 'jest';

const config: Config = {
    verbose: true,
    preset: 'ts-jest',
    testMatch: ['**/*.test.ts'],
};

export default config;
