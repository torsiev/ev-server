import { logger } from 'app/logger';
import 'dotenv/config';
import {
  AuthorizeResponse,
  BootNotificationResponse,
  DataTransferResponse,
  DiagnosticsStatusNotifResponse,
  FirmwareStatusNotifResponse,
  HeartbeatResponse,
  MeterValuesResponse,
  StartTransactionResponse,
  StatusNotifResponse,
  StopTransactionResponse,
} from 'types/ocpp/ocppClient';
import { OCPPActions } from 'types/ocpp/ocppCommon';
import { validateOCPP } from 'utils/ocppUtil';
import {
  authorizeSchema,
  bootNotificationSchema,
  dataTransferSchema,
  diagnosticStatusNotifSchema,
  firmwareStatusNotifSchema,
  heartbeatSchema,
  meterValuesSchema,
  startTransactionSchema,
  statusNotifSchema,
  stopTransactionSchema,
} from 'validations/ocppValidation';

const service = 'OCPPClientService';

export default class OcppClientService {
  authorize(payload: Record<string, unknown>): AuthorizeResponse {
    const validated = validateOCPP(
      authorizeSchema,
      payload,
      OCPPActions.AUTHORIZE,
    );

    logger.info(`User has been authorized with RFID card ${validated.idTag}`, {
      service,
    });

    return {
      idTagInfo: {
        status: 'Accepted',
      },
    };
  }

  bootNotification(payload: Record<string, unknown>): BootNotificationResponse {
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

  dataTransfer(payload: Record<string, unknown>): DataTransferResponse {
    const validated = validateOCPP(
      dataTransferSchema,
      payload,
      OCPPActions.DATA_TRANSFER,
    );

    logger.info(`Data transfer received from ${validated.vendorId}`, {
      service,
    });

    return {
      status: 'Accepted',
    };
  }

  diagnosticsStatusNotif(
    payload: Record<string, unknown>,
  ): DiagnosticsStatusNotifResponse {
    const validated = validateOCPP(
      diagnosticStatusNotifSchema,
      payload,
      OCPPActions.DIAGNOSTICS_STATUS_NOTIF,
    );

    logger.info(
      `Diagnostics status notification received with status: ${validated.status}`,
      { service },
    );

    return {};
  }

  firmwareStatusNotif(
    payload: Record<string, unknown>,
  ): FirmwareStatusNotifResponse {
    const validated = validateOCPP(
      firmwareStatusNotifSchema,
      payload,
      OCPPActions.FIRMWARE_STATUS_NOTIF,
    );

    logger.info(
      `Firmware status notification received with status: ${validated.status}`,
      { service },
    );

    return {};
  }

  heartbeat(payload: Record<string, unknown>): HeartbeatResponse {
    validateOCPP(heartbeatSchema, payload, OCPPActions.HEARTBEAT);

    return {
      currentTime: new Date(),
    };
  }

  meterValues(payload: Record<string, unknown>): MeterValuesResponse {
    const validated = validateOCPP(
      meterValuesSchema,
      payload,
      OCPPActions.METER_VALUES,
    );

    logger.info(
      `Meter values received from connector ${validated.connectorId}`,
      {
        service,
      },
    );

    return {};
  }

  startTransaction(payload: Record<string, unknown>): StartTransactionResponse {
    const validated = validateOCPP(
      startTransactionSchema,
      payload,
      OCPPActions.START_TRANSACTION,
    );

    logger.info(`Transaction started on connector ${validated.connectorId}`, {
      service,
    });

    return {
      transactionId: 1,
      idTagInfo: {
        status: 'Accepted',
      },
    };
  }

  statusNotif(payload: Record<string, unknown>): StatusNotifResponse {
    const validated = validateOCPP(
      statusNotifSchema,
      payload,
      OCPPActions.STATUS_NOTIFICATION,
    );

    logger.info(
      `Status notification received from connector ${validated.connectorId}`,
      { service },
    );

    return {};
  }

  stopTransaction(payload: Record<string, unknown>): StopTransactionResponse {
    const validated = validateOCPP(
      stopTransactionSchema,
      payload,
      OCPPActions.STOP_TRANSACTION,
    );

    logger.info(`Transaction stopped: ${validated.transactionId}`, { service });

    return {
      idTagInfo: {
        status: 'Accepted',
      },
    };
  }
}
