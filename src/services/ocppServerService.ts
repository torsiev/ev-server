import { logger } from 'app/logger';
import { randomUUID } from 'crypto';
import {
  OCPPActions,
  OCPPErrorResponse,
  OCPPMessageType,
  OCPPRequest,
  OCPPResponse,
} from 'types/ocpp/ocppCommon';
import {
  ChangeAvailabilityResponse,
  ChangeConfigResponse,
  ClearCacheResponse,
  GetConfigResponse,
  RemoteStartTransactionResponse,
  ResetResponse,
  UnlockConnectorResponse,
} from 'types/ocpp/ocppServer';
import { OCPPError, validateOCPP } from 'utils/ocppUtil';
import { RestError } from 'utils/restError';
import {
  changeAvailabilityReqSchema,
  changeAvailabilityResSchema,
  changeConfigReqSchema,
  changeConfigResSchema,
  clearCacheReqSchema,
  clearCacheResSchema,
  getConfigReqSchema,
  getConfigResSchema,
  remoteStartTransactionReqSchema,
  remoteStartTransactionResSchema,
  remoteStopTransactionReqSchema,
  remoteStopTransactionResSchema,
  resetReqSchema,
  resetResSchema,
  unlockConnectorReqSchema,
  unlockConnectorResSchema,
} from 'validations/ocppValidation';
import { RawData, WebSocket } from 'ws';

const service = 'OCPPServerService';

export default class OcppServerService {
  // Helper method to handle WebSocket response from charging station
  #wsClientResponse(ws: WebSocket): Promise<OCPPResponse> {
    return new Promise((resolve, reject) => {
      const messageHandler = (data: RawData) => {
        const message: OCPPResponse | OCPPErrorResponse = JSON.parse(
          data.toString(),
        );

        if (message[0] === OCPPMessageType.CALL_ERROR) {
          logger.error(`Charging station response with error, ${message}`, {
            service,
          });
          reject(new Error(`Charging station response with error, ${message}`));
        }

        resolve(message as OCPPResponse);

        clearListeners();
      };
      const errorHandler = (error: Error) => {
        reject(error);
        clearListeners();
      };
      const closeHandler = () => {
        reject(new RestError(410, 'Charging station disconnected'));
        clearListeners();
      };
      const clearListeners = () => {
        ws.off('message', messageHandler);
        ws.off('close', closeHandler);
        ws.off('error', errorHandler);
      };

      ws.on('message', messageHandler);
      ws.on('close', closeHandler);
      ws.on('error', errorHandler);
    });
  }

  #buildRequest(action: OCPPActions, payload: Record<string, unknown>): string {
    return JSON.stringify([
      OCPPMessageType.CALL,
      randomUUID(),
      action,
      payload,
    ] as OCPPRequest);
  }

  async changeAvailability(
    client: WebSocket,
    payload: Record<string, unknown>,
  ): Promise<ChangeAvailabilityResponse> {
    const validatedPayload = changeAvailabilityReqSchema.safeParse(payload);
    if (!validatedPayload.success) {
      throw new RestError(
        400,
        'Invalid payload',
        validatedPayload.error.issues,
      );
    }

    client.send(
      this.#buildRequest(
        OCPPActions.CHANGE_AVAILABILITY,
        validatedPayload.data,
      ),
    );
    const cpResponse = await this.#wsClientResponse(client);

    try {
      return validateOCPP(
        changeAvailabilityResSchema,
        cpResponse[2],
        OCPPActions.CHANGE_AVAILABILITY,
      );
    } catch (error) {
      if (error instanceof OCPPError) {
        throw new RestError(
          422,
          'Cannot process response from charging station, uncompatible charging station',
        );
      }

      throw new RestError(500, 'Internal server error');
    }
  }

  async changeConfiguration(
    client: WebSocket,
    payload: Record<string, unknown>,
  ): Promise<ChangeConfigResponse> {
    const validatedPayload = changeConfigReqSchema.safeParse(payload);

    if (!validatedPayload.success) {
      throw new RestError(
        400,
        'Invalid payload',
        validatedPayload.error.issues,
      );
    }

    client.send(
      this.#buildRequest(
        OCPPActions.CHANGE_CONFIGURATION,
        validatedPayload.data,
      ),
    );

    const cpResponse = await this.#wsClientResponse(client);

    try {
      return validateOCPP(
        changeConfigResSchema,
        cpResponse[2],
        OCPPActions.CHANGE_CONFIGURATION,
      );
    } catch (error) {
      if (error instanceof OCPPError) {
        throw new RestError(
          422,
          'Cannot process response from charging station, uncompatible charging station',
        );
      }

      throw new RestError(500, 'Internal server error');
    }
  }

  async clearCache(
    client: WebSocket,
    payload: Record<string, unknown>,
  ): Promise<ClearCacheResponse> {
    const validatedPayload = clearCacheReqSchema.safeParse(payload);

    if (!validatedPayload.success) {
      throw new RestError(
        400,
        'Invalid payload',
        validatedPayload.error.issues,
      );
    }

    client.send(
      this.#buildRequest(OCPPActions.CLEAR_CACHE, validatedPayload.data),
    );

    const cpResponse = await this.#wsClientResponse(client);

    try {
      return validateOCPP(
        clearCacheResSchema,
        cpResponse[2],
        OCPPActions.CLEAR_CACHE,
      );
    } catch (error) {
      if (error instanceof OCPPError) {
        throw new RestError(
          422,
          'Cannot process response from charging station, uncompatible charging station',
        );
      }

      throw new RestError(500, 'Internal server error');
    }
  }

  async getConfiguration(
    client: WebSocket,
    payload: Record<string, unknown>,
  ): Promise<GetConfigResponse> {
    const validatedPayload = getConfigReqSchema.safeParse(payload);

    if (!validatedPayload.success) {
      throw new RestError(
        400,
        'Invalid payload',
        validatedPayload.error.issues,
      );
    }

    client.send(
      this.#buildRequest(OCPPActions.GET_CONFIGURATION, validatedPayload.data),
    );

    const cpResponse = await this.#wsClientResponse(client);

    try {
      return validateOCPP(
        getConfigResSchema,
        cpResponse[2],
        OCPPActions.GET_CONFIGURATION,
      );
    } catch (error) {
      if (error instanceof OCPPError) {
        throw new RestError(
          422,
          'Cannot process response from charging station, uncompatible charging station',
        );
      }

      throw new RestError(500, 'Internal server error');
    }
  }

  async remoteStartTransaction(
    client: WebSocket,
    payload: Record<string, unknown>,
  ): Promise<RemoteStartTransactionResponse> {
    const validatedPayload = remoteStartTransactionReqSchema.safeParse(payload);

    if (!validatedPayload.success) {
      throw new RestError(
        400,
        'Invalid payload',
        validatedPayload.error.issues,
      );
    }

    client.send(
      this.#buildRequest(
        OCPPActions.REMOTE_START_TRANSACTION,
        validatedPayload.data,
      ),
    );

    const cpResponse = await this.#wsClientResponse(client);

    try {
      return validateOCPP(
        remoteStartTransactionResSchema,
        cpResponse[2],
        OCPPActions.REMOTE_START_TRANSACTION,
      );
    } catch (error) {
      if (error instanceof OCPPError) {
        throw new RestError(
          422,
          'Cannot process response from charging station, uncompatible charging station',
        );
      }

      throw new RestError(500, 'Internal server error');
    }
  }

  async remoteStopTransaction(
    client: WebSocket,
    payload: Record<string, unknown>,
  ): Promise<RemoteStartTransactionResponse> {
    const validatedPayload = remoteStopTransactionReqSchema.safeParse(payload);

    if (!validatedPayload.success) {
      throw new RestError(
        400,
        'Invalid payload',
        validatedPayload.error.issues,
      );
    }

    client.send(
      this.#buildRequest(
        OCPPActions.REMOTE_STOP_TRANSACTION,
        validatedPayload.data,
      ),
    );

    const cpResponse = await this.#wsClientResponse(client);

    try {
      return validateOCPP(
        remoteStopTransactionResSchema,
        cpResponse[2],
        OCPPActions.REMOTE_STOP_TRANSACTION,
      );
    } catch (error) {
      if (error instanceof OCPPError) {
        throw new RestError(
          422,
          'Cannot process response from charging station, uncompatible charging station',
        );
      }

      throw new RestError(500, 'Internal server error');
    }
  }

  async reset(
    client: WebSocket,
    payload: Record<string, unknown>,
  ): Promise<ResetResponse> {
    const validatedPayload = resetReqSchema.safeParse(payload);

    if (!validatedPayload.success) {
      throw new RestError(
        400,
        'Invalid payload',
        validatedPayload.error.issues,
      );
    }

    client.send(this.#buildRequest(OCPPActions.RESET, validatedPayload.data));

    const cpResponse = await this.#wsClientResponse(client);

    try {
      return validateOCPP(resetResSchema, cpResponse[2], OCPPActions.RESET);
    } catch (error) {
      if (error instanceof OCPPError) {
        throw new RestError(
          422,
          'Cannot process response from charging station, uncompatible charging station',
        );
      }

      throw new RestError(500, 'Internal server error');
    }
  }

  async unlockConnector(
    client: WebSocket,
    payload: Record<string, unknown>,
  ): Promise<UnlockConnectorResponse> {
    const validatedPayload = unlockConnectorReqSchema.safeParse(payload);

    if (!validatedPayload.success) {
      throw new RestError(
        400,
        'Invalid payload',
        validatedPayload.error.issues,
      );
    }

    client.send(
      this.#buildRequest(OCPPActions.UNLOCK_CONNECTOR, validatedPayload.data),
    );

    const cpResponse = await this.#wsClientResponse(client);

    try {
      return validateOCPP(
        unlockConnectorResSchema,
        cpResponse[2],
        OCPPActions.UNLOCK_CONNECTOR,
      );
    } catch (error) {
      if (error instanceof OCPPError) {
        throw new RestError(
          422,
          'Cannot process response from charging station, uncompatible charging station',
        );
      }

      throw new RestError(500, 'Internal server error');
    }
  }
}
