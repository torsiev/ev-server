import { logger } from 'app/logger';
import { OCPPActions, OCPPErrorType } from 'types/ocpp/ocppCommon';
import z from 'zod';

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

export function urlToClientId(url?: string): string {
  if (!url) return '';

  const paths = url?.split('/');
  return paths[paths.length - 1];
}

export function logOCPPError(
  module: string,
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
    { module },
  );
}

/**
 * Helper function to validate OCPP payload
 * @param schema OCPP Zod schema
 * @param payload Data to validate
 * @param action What action is being validated
 * @returns
 */
export function validateOCPP<T extends z.ZodTypeAny>(
  schema: T,
  payload: Record<string, unknown>,
  action: OCPPActions,
): z.infer<T> {
  const validated = schema.safeParse(payload);

  if (!validated.success) {
    const errorCode = validated.error.errors.map((err) => err.code);
    if (errorCode.includes('too_big') || errorCode.includes('too_small')) {
      throw new OCPPError(
        OCPPErrorType.PROPERTY_CONSTRAINT_VIOLATION,
        'Invalid payload value',
        action,
        { details: validated.error.issues },
      );
    } else {
      throw new OCPPError(
        OCPPErrorType.TYPE_CONSTRAINT_VIOLATION,
        'Invalid payload type',
        action,
        { details: validated.error.issues },
      );
    }
  }

  return validated.data;
}
