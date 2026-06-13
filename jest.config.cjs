/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.vue$': '<rootDir>/jest.vue-transformer.cjs',
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: './tests/tsconfig.json',
      },
    ],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/tests/unit/**/*.test.ts', '**/tests/components/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'vue', 'json'],
}
