import { logger } from 'app/logger';
import { OCPPActions, OCPPErrorType } from 'types/ocpp/ocppCommon';
import z from 'zod';

/**
 * Custom Error class for OCPP errors
 */
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

/**
 * Utility function to get OCPP Client ID from URL
 * @param url - URL to extract client ID
 * @returns client ID extracted from URL
 *
 * @example
 * urlToClientId('http://localhost:3000/OCPP16/123') // '123'
 */
export function urlToClientId(url?: string): string {
  if (!url) return '';

  const paths = url?.split('/');
  return paths[paths.length - 1];
}

/**
 * Helper function to format OCPP log errors
 * @param module Project module name
 * @param client OCPP client ID
 * @param code Error type
 * @param message Error message
 * @param action OCPP action that caused the error
 */
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
