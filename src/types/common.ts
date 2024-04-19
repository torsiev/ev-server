export const APP_ENV = {
  DEV: 'dev',
  PROD: 'prod',
  TEST: 'test',
} as const;

export type AppEnv = (typeof APP_ENV)[keyof typeof APP_ENV];
