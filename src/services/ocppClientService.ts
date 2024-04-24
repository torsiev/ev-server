import { db } from 'app/db';
import { logger } from 'app/logger';
import {
  chargeboxes,
  connectorStatuses,
  connectors,
  meterValues,
  ocppTags,
  transactionStarts,
  transactionStops,
} from 'db/schema';
import 'dotenv/config';
import { and, eq } from 'drizzle-orm';
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
import { MeterValue, OCPPActions, OCPPErrorType } from 'types/ocpp/ocppCommon';
import { WssProtocol } from 'types/server';
import { logOCPPError, validateOCPP } from 'utils/ocppUtil';
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
  async authorize(
    clientId: string,
    payload: Record<string, unknown>,
  ): Promise<AuthorizeResponse> {
    const validated = validateOCPP(
      authorizeSchema,
      payload,
      OCPPActions.AUTHORIZE,
    );

    try {
      // ------------------------------------------------------------------
      // Check if RFID card is registered and not expired
      // ------------------------------------------------------------------
      const [ocppTag] = await db
        .select()
        .from(ocppTags)
        .where(eq(ocppTags.idTag, validated.idTag));

      if (!ocppTag) {
        logger.info(`RFID card ${validated.idTag} is not registered`, {
          service,
        });

        return {
          idTagInfo: {
            status: 'Invalid',
          },
        };
      } else if (
        ocppTag.expiredDate !== null &&
        ocppTag.expiredDate.getTime() < Date.now()
      ) {
        logger.info(`RFID card ${ocppTag.idTag} is expired`, {
          service,
        });
        return {
          idTagInfo: {
            status: 'Expired',
            expiryDate: ocppTag.expiredDate ?? undefined,
            parentIdTag: ocppTag.parentIdTag ?? undefined,
          },
        };
      }

      logger.info(
        `User with RFID card ${ocppTag.idTag} has been authorized to charge`,
        {
          service,
        },
      );

      return {
        idTagInfo: {
          status: 'Accepted',
          expiryDate: ocppTag.expiredDate ?? undefined,
          parentIdTag: ocppTag.parentIdTag ?? undefined,
        },
      };
    } catch (error) {
      logOCPPError(
        service,
        clientId,
        OCPPErrorType.INTERNAL_ERROR,
        (error as Error).message,
        OCPPActions.AUTHORIZE,
      );
      return {
        idTagInfo: {
          status: 'Blocked',
        },
      };
    }
  }

  async bootNotification(
    clientId: string,
    payload: Record<string, unknown>,
  ): Promise<BootNotificationResponse> {
    // Get default heartbeat interval from env, if not set, use 120 seconds
    const heartbeatInterval =
      Number(process.env['OCPP16_HEARTBEAT_INTERVAL']) || 120;
    // validate payload
    const {
      chargePointVendor,
      chargePointModel,
      chargePointSerialNumber,
      chargeBoxSerialNumber,
      firmwareVersion,
      iccid,
      imsi,
      meterType,
      meterSerialNumber,
    } = validateOCPP(
      bootNotificationSchema,
      payload,
      OCPPActions.BOOT_NOTIFICATION,
    );

    logger.info(
      `Boot notification received from ${chargePointVendor} ${chargePointModel}`,
      { service },
    );

    try {
      // Update chargebox data in database
      await db
        .update(chargeboxes)
        .set({
          ocppProtocol: WssProtocol.OCPP16,
          chargePointVendor,
          chargePointModel,
          chargePointSerialNumber,
          chargeBoxSerialNumber,
          firmwareVersion,
          iccid,
          imsi,
          meterType,
          meterSerialNumber,
        })
        .where(eq(chargeboxes.identifier, clientId));

      return {
        status: 'Accepted',
        currentTime: new Date(),
        interval: heartbeatInterval,
      };
    } catch (error) {
      // If database update failed, log error and send rejected response
      // then close the WebSocket connection
      logOCPPError(
        service,
        clientId,
        OCPPErrorType.INTERNAL_ERROR,
        (error as Error).message,
        OCPPActions.BOOT_NOTIFICATION,
      );
      return {
        status: 'Rejected',
        currentTime: new Date(),
        interval: 0,
      };
    }
  }

  /**
   * * Dummy implementation. It must be vendor specific.
   *
   * Since it's dummy, it will always return status 'Accepted'
   */
  dataTransfer(
    clientId: string,
    payload: Record<string, unknown>,
  ): DataTransferResponse {
    const validated = validateOCPP(
      dataTransferSchema,
      payload,
      OCPPActions.DATA_TRANSFER,
    );

    logger.info(`Data transfer received from station with ID:${clientId}`, {
      service,
    });

    if (validated.messageId) {
      logger.info(`Data transfer message ID: ${validated.messageId}`, {
        service,
      });
    }

    if (validated.messageId) {
      logger.info(`Data transfer message ID: ${validated.messageId}`, {
        service,
      });
    }

    return {
      status: 'Accepted',
    };
  }

  // TODO: Implement diagnosticsStatusNotif
  diagnosticsStatusNotif(
    clientId: string,
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

  // TODO: Implement firmwareStatusNotif
  firmwareStatusNotif(
    clientId: string,
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

  // TODO: Implement heartbeat
  heartbeat(
    clientId: string,
    payload: Record<string, unknown>,
  ): HeartbeatResponse {
    validateOCPP(heartbeatSchema, payload, OCPPActions.HEARTBEAT);

    return {
      currentTime: new Date(),
    };
  }

  async meterValues(
    clientId: string,
    payload: Record<string, unknown>,
  ): Promise<MeterValuesResponse> {
    const validated = validateOCPP(
      meterValuesSchema,
      payload,
      OCPPActions.METER_VALUES,
    );

    try {
      const getConnectorId = await this.#getOrInsertConnectorId(
        clientId,
        validated.connectorId,
      );

      if (validated.connectorId !== 0) {
        this.#batchInsertMeterValues(
          getConnectorId,
          validated.transactionId ?? null,
          validated.meterValue,
        );
      } else if (validated.connectorId === 0) {
        this.#batchInsertMeterValues(
          getConnectorId,
          null,
          validated.meterValue,
        );
      }
    } catch (error) {
      logOCPPError(
        service,
        clientId,
        OCPPErrorType.INTERNAL_ERROR,
        (error as Error).message,
        OCPPActions.METER_VALUES,
      );
    }

    return {};
  }

  async startTransaction(
    clientId: string,
    payload: Record<string, unknown>,
  ): Promise<StartTransactionResponse> {
    const validated = validateOCPP(
      startTransactionSchema,
      payload,
      OCPPActions.START_TRANSACTION,
    );

    try {
      // Get Connector data from database
      const getConnectorId = await this.#getOrInsertConnectorId(
        clientId,
        validated.connectorId,
      );
      // Get user ocppTag data from database
      const [ocppTag] = await db
        .select()
        .from(ocppTags)
        .where(eq(ocppTags.idTag, validated.idTag));
      // Insert new transaction data even if the RFID card is not registered, to prevent data loss
      const getTransactionId = await this.#insertOrIgnoreTransaction(
        getConnectorId,
        validated.idTag,
        validated.timestamp,
        validated.meterStart,
      );

      // ------------------------------------------------------------------
      // Check if RFID card is registered and not expired and set idTagInfo
      // ------------------------------------------------------------------
      let idTagInfo: AuthorizeResponse = {
        idTagInfo: {
          status: 'Accepted',
          expiryDate: ocppTag.expiredDate || undefined,
          parentIdTag: ocppTag.parentIdTag || undefined,
        },
      };

      if (!ocppTag) {
        logger.warn(
          `The transaction ${getTransactionId} contains an unknown idTag ${validated.idTag}` +
            `which was inserted into DB to prevent information loss and has been blocked`,
          {
            service,
          },
        );

        idTagInfo = {
          idTagInfo: {
            status: 'Invalid',
          },
        };
      } else if (
        ocppTag.expiredDate !== null &&
        ocppTag.expiredDate.getTime() < Date.now()
      ) {
        logger.info(
          `The transaction ${getTransactionId} contains an expired idTag ${validated.idTag}` +
            `which was inserted into DB to prevent information loss and has been blocked`,
          {
            service,
          },
        );
        idTagInfo = {
          idTagInfo: {
            status: 'Expired',
            expiryDate: ocppTag.expiredDate ?? undefined,
            parentIdTag: ocppTag.parentIdTag ?? undefined,
          },
        };
      }

      logger.info(
        `Transaction ${getTransactionId} started on connector ${validated.connectorId}`,
        {
          service,
        },
      );

      return {
        transactionId: getTransactionId,
        ...idTagInfo,
      };
    } catch (error) {
      logOCPPError(
        service,
        clientId,
        OCPPErrorType.INTERNAL_ERROR,
        (error as Error).message,
        OCPPActions.START_TRANSACTION,
      );
      return {
        transactionId: 0,
        idTagInfo: {
          status: 'Blocked',
        },
      };
    }
  }

  async statusNotif(
    clientId: string,
    payload: Record<string, unknown>,
  ): Promise<StatusNotifResponse> {
    const {
      connectorId,
      status,
      errorCode,
      info,
      timestamp,
      vendorId,
      vendorErrorCode,
    } = validateOCPP(
      statusNotifSchema,
      payload,
      OCPPActions.STATUS_NOTIFICATION,
    );

    try {
      const getConnectorId = await this.#getOrInsertConnectorId(
        clientId,
        connectorId,
      );

      await db.insert(connectorStatuses).values({
        connectorPk: getConnectorId,
        status,
        statusTimestamp: timestamp ?? new Date(),
        errorCode,
        errorInfo: info,
        vendorId,
        vendorErrorCode,
      });
      logger.info(
        `Status notification received from station ${clientId} on connector ${getConnectorId}`,
        { service },
      );
    } catch (error) {
      logOCPPError(
        service,
        clientId,
        OCPPErrorType.INTERNAL_ERROR,
        (error as Error).message,
        OCPPActions.STATUS_NOTIFICATION,
      );
    }

    return {};
  }

  async stopTransaction(
    clientId: string,
    payload: Record<string, unknown>,
  ): Promise<StopTransactionResponse> {
    const validated = validateOCPP(
      stopTransactionSchema,
      payload,
      OCPPActions.STOP_TRANSACTION,
    );

    try {
      // --------------------------------------------
      // Insert transaction stop data and meter values
      // --------------------------------------------
      await db.insert(transactionStops).values({
        transactionId: validated.transactionId,
        eventActor: 'station',
        stopTimestamp: validated.timestamp,
        meterStop: validated.meterStop,
        stopReason: validated.reason ?? 'Local',
      });

      const [transaction] = await db
        .select({ connectorId: transactionStarts.connectorPk })
        .from(transactionStarts)
        .where(eq(transactionStarts.transactionId, validated.transactionId));

      await this.#batchInsertMeterValues(
        transaction.connectorId,
        validated.transactionId,
        validated.transactionData as MeterValue[],
      );

      // Accept if idTag is not provided, in case of emergency stop e.g. charging station reset
      if (!validated.idTag) {
        return {
          idTagInfo: {
            status: 'Accepted',
          },
        };
      }

      // Get user ocppTag data from database
      const [ocppTag] = await db
        .select()
        .from(ocppTags)
        .where(eq(ocppTags.idTag, validated.idTag!));

      // ------------------------------------------------------------------
      // Check if RFID card is registered and not expired and set idTagInfo
      // ------------------------------------------------------------------
      let idTagInfo: AuthorizeResponse = {
        idTagInfo: {
          status: 'Accepted',
          expiryDate: ocppTag.expiredDate || undefined,
          parentIdTag: ocppTag.parentIdTag || undefined,
        },
      };
      if (!ocppTag) {
        logger.info(
          `Unknown idTag ${validated.idTag} try to stop transaction ${validated.transactionId}`,
          {
            service,
          },
        );

        idTagInfo = {
          idTagInfo: {
            status: 'Invalid',
          },
        };
      } else if (
        ocppTag.expiredDate !== null &&
        ocppTag.expiredDate.getTime() < Date.now()
      ) {
        logger.info(
          `IdTag ${validated.idTag} is expired can't stop transaction`,
          {
            service,
          },
        );
        idTagInfo = {
          idTagInfo: {
            status: 'Expired',
            expiryDate: ocppTag.expiredDate ?? undefined,
            parentIdTag: ocppTag.parentIdTag ?? undefined,
          },
        };
      }
      return idTagInfo;
    } catch (error) {
      logOCPPError(
        service,
        clientId,
        OCPPErrorType.INTERNAL_ERROR,
        (error as Error).message,
        OCPPActions.STOP_TRANSACTION,
      );
      return {
        idTagInfo: {
          status: 'Blocked',
        },
      };
    }
  }

  /**
   * Check if connector exists in database, if not insert new connector
   * @param clientId
   * @param connectorId
   * @returns connector id
   */
  async #getOrInsertConnectorId(
    clientId: string,
    connectorId: number,
  ): Promise<number> {
    try {
      // Get Connector data from database
      const connector = await db
        .select({ id: connectors.id })
        .from(connectors)
        .innerJoin(chargeboxes, eq(connectors.chargeboxId, chargeboxes.id))
        .where(
          and(
            eq(chargeboxes.identifier, clientId),
            eq(connectors.connectorId, connectorId),
          ),
        );

      // If connector does not exist, insert new connector
      if (!connector.length) {
        const [chargebox] = await db
          .select({ id: chargeboxes.id })
          .from(chargeboxes)
          .where(eq(chargeboxes.identifier, clientId));

        const newConnector = await db.insert(connectors).values({
          chargeboxId: chargebox.id,
          connectorId,
        });

        return newConnector[0].insertId;
      }

      return connector[0].id;
    } catch (error) {
      logger.error(
        `Get or insert connector fail: ${(error as Error).message}`,
        {
          service,
        },
      );
      return 0;
    }
  }

  /**
   * Check if transaction data already exists, to prevent data duplication
   * @param connectorId
   * @param idTag
   * @param timestamp
   * @param meterStart
   * @returns transaction id
   */
  async #insertOrIgnoreTransaction(
    connectorId: number,
    idTag: string,
    timestamp: Date,
    meterStart: number,
  ): Promise<number> {
    try {
      const transaction = await db
        .select({ id: transactionStarts.transactionId })
        .from(transactionStarts)
        .where(
          and(
            eq(transactionStarts.connectorPk, connectorId),
            eq(transactionStarts.idTag, idTag),
            eq(transactionStarts.startTimestamp, timestamp),
            eq(transactionStarts.meterStart, meterStart),
          ),
        );

      if (!transaction.length) {
        const newTransaction = await db.insert(transactionStarts).values({
          connectorPk: connectorId,
          idTag,
          startTimestamp: timestamp,
          meterStart,
        });

        return newTransaction[0].insertId;
      }
      return transaction[0].id;
    } catch (error) {
      logger.error(`Insert transaction fail: ${(error as Error).message}`, {
        service,
      });
      return 0;
    }
  }

  /**
   * Insert meter values data in batch
   * @param meterVals
   * @param connectorId
   * @param transactionId
   */
  async #batchInsertMeterValues(
    connectorId: number,
    transactionId: number | null,
    meterVals?: MeterValue[],
  ) {
    try {
      if (!meterVals) return;

      const data = meterVals?.flatMap((meterVal) =>
        meterVal.sampledValue.map((sampledVal) => ({
          connectorPk: connectorId,
          transactionId,
          timestamp: meterVal.timestamp,
          value: sampledVal.value,
          readingContext: sampledVal.context,
          format: sampledVal.format,
          measurand: sampledVal.measurand,
          location: sampledVal.location,
          unit: sampledVal.unit,
          phase: sampledVal.phase,
        })),
      );

      await db.insert(meterValues).values(data);
    } catch (error) {
      logger.error(`Insert meter values fail: ${(error as Error).message}`, {
        service,
      });
    }
  }
}
