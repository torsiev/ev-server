import { logger } from 'app/logger';
import { OCPPActions, OCPPErrorType } from 'types/ocpp/ocppCommon';

export class OCPPError extends Error {
  code: OCPPErrorType;
  action: OCPPActions | undefined;
  details: Record<string, unknown> = {};

  constructor(
    code: OCPPErrorType,
    message: string,
    action?: OCPPActions,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.code = code;
    this.action = action;
    this.details = details ?? {};
  }
}

export function getClientId(url?: string): string {
  if (!url) return '';

  const paths = url?.split('/');
  return paths[paths.length - 1];
}

export function logOCPPError(
  service: string,
  client: string,
  code: OCPPErrorType,
  message: string,
  action?: OCPPActions,
) {
  logger.error(
    JSON.stringify({
      client,
      code,
      action,
      message,
    }),
    { service },
  );
}
