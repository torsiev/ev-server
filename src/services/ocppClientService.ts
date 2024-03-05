import { logger } from 'app/logger';
import 'dotenv/config';
import {
  AuthorizeResponse,
  BootNotificationResponse,
  HeartbeatResponse,
} from 'types/ocpp/ocppClient';
import { OCPPActions, OCPPErrorType } from 'types/ocpp/ocppCommon';
import { OCPPError } from 'utils/ocppUtil';
import {
  authorizeSchema,
  bootNotificationSchema,
  heartbeatSchema,
} from 'validations/ocppValidation';
import { z } from 'zod';

const service = 'OCPPClientService';

/**
 * Helper function to validate OCPP payload
 * @param schema OCPP Zod schema
 * @param payload Data to validate
 * @param action What action is being validated
 * @returns
 */
function validateOCPP<T extends z.ZodTypeAny>(
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

function authorize(payload: Record<string, unknown>): AuthorizeResponse {
  const validated = validateOCPP(
    authorizeSchema,
    payload,
    OCPPActions.AUTHORIZE,
  );

  logger.info(`User has been authorized with RFID card ${validated.idTag}`, {
    service: service,
  });

  return {
    idTagInfo: {
      status: 'Accepted',
    },
  };
}

function bootNotification(
  payload: Record<string, unknown>,
): BootNotificationResponse {
  const heartbeatInterval =
    Number(process.env.OCPP16_HEARTBEAT_INTERVAL) || 120;
  const validated = validateOCPP(
    bootNotificationSchema,
    payload,
    OCPPActions.BOOT_NOTIFICATION,
  );

  logger.info(
    `Boot notification received from ${validated.chargePointVendor} ${validated.chargePointModel}`,
    { service },
  );

  return {
    status: 'Accepted',
    currentTime: new Date(),
    interval: heartbeatInterval,
  };
}

function heartbeat(payload: Record<string, unknown>): HeartbeatResponse {
  validateOCPP(heartbeatSchema, payload, OCPPActions.HEARTBEAT);

  return {
    currentTime: new Date(),
  };
}

export default {
  authorize,
  bootNotification,
  heartbeat,
};
