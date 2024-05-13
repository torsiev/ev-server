/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^app/(.*)': '<rootDir>/src/app/$1',
    '^controllers/(.*)': '<rootDir>/src/controllers/$1',
    '^middlewares/(.*)': '<rootDir>/src/middlewares/$1',
    '^routes/(.*)': '<rootDir>/src/routes/$1',
    '^services/(.*)': '<rootDir>/src/services/$1',
    '^types/(.*)': '<rootDir>/src/types/$1',
    '^utils/(.*)': '<rootDir>/src/utils/$1',
    '^validations/(.*)': '<rootDir>/src/validations/$1',
    '^db/(.*)': '<rootDir>/src/db/$1',
  },
};
