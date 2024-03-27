import { randomUUID } from 'crypto';
import {
  OCPPActions,
  OCPPErrorResponse,
  OCPPIncomingRequest,
  OCPPMessageType,
  OCPPOutgoingResponse,
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

export default class OcppServerService {
  // Helper method to handle WebSocket response from charging station
  #wsClientResponse(ws: WebSocket): Promise<OCPPOutgoingResponse> {
    return new Promise((resolve, reject) => {
      const messageHandler = (data: RawData) => {
        const message: OCPPOutgoingResponse = JSON.parse(data.toString());

        resolve(message);

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

  #handleOcppErr(err: unknown, client: WebSocket, resId: string) {
    if (err instanceof OCPPError) {
      if (client.readyState !== WebSocket.CLOSED) {
        const msg: OCPPErrorResponse = [
          OCPPMessageType.CALL_ERROR,
          resId,
          err.code,
          err.message,
          err.details,
        ];
        client.send(JSON.stringify(msg));
      }

      throw new RestError(
        422,
        'Cannot process response from charging station, uncompatible charging station',
      );
    }
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
      JSON.stringify([
        OCPPMessageType.CALL_RESULT,
        randomUUID(),
        OCPPActions.CHANGE_AVAILABILITY,
        validatedPayload.data,
      ] as OCPPIncomingRequest),
    );
    const cpResponse = await this.#wsClientResponse(client);

    try {
      return validateOCPP(
        changeAvailabilityResSchema,
        cpResponse[2],
        OCPPActions.CHANGE_AVAILABILITY,
      );
    } catch (error) {
      this.#handleOcppErr(error, client, cpResponse[1]);

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
      JSON.stringify([
        OCPPMessageType.CALL_RESULT,
        randomUUID(),
        OCPPActions.CHANGE_CONFIGURATION,
        validatedPayload.data,
      ] as OCPPIncomingRequest),
    );

    const cpResponse = await this.#wsClientResponse(client);

    try {
      return validateOCPP(
        changeConfigResSchema,
        cpResponse[2],
        OCPPActions.CHANGE_CONFIGURATION,
      );
    } catch (error) {
      this.#handleOcppErr(error, client, cpResponse[1]);

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
      JSON.stringify([
        OCPPMessageType.CALL_RESULT,
        randomUUID(),
        OCPPActions.CLEAR_CACHE,
        validatedPayload.data,
      ] as OCPPIncomingRequest),
    );

    const cpResponse = await this.#wsClientResponse(client);

    try {
      return validateOCPP(
        clearCacheResSchema,
        cpResponse[2],
        OCPPActions.CLEAR_CACHE,
      );
    } catch (error) {
      this.#handleOcppErr(error, client, cpResponse[1]);

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
      JSON.stringify([
        OCPPMessageType.CALL_RESULT,
        randomUUID(),
        OCPPActions.GET_CONFIGURATION,
        validatedPayload.data,
      ] as OCPPIncomingRequest),
    );

    const cpResponse = await this.#wsClientResponse(client);

    try {
      return validateOCPP(
        getConfigResSchema,
        cpResponse[2],
        OCPPActions.GET_CONFIGURATION,
      );
    } catch (error) {
      this.#handleOcppErr(error, client, cpResponse[1]);

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
      JSON.stringify([
        OCPPMessageType.CALL_RESULT,
        randomUUID(),
        OCPPActions.REMOTE_START_TRANSACTION,
        validatedPayload.data,
      ] as OCPPIncomingRequest),
    );

    const cpResponse = await this.#wsClientResponse(client);

    try {
      return validateOCPP(
        remoteStartTransactionResSchema,
        cpResponse[2],
        OCPPActions.REMOTE_START_TRANSACTION,
      );
    } catch (error) {
      this.#handleOcppErr(error, client, cpResponse[1]);

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
      JSON.stringify([
        OCPPMessageType.CALL_RESULT,
        randomUUID(),
        OCPPActions.REMOTE_STOP_TRANSACTION,
        validatedPayload.data,
      ] as OCPPIncomingRequest),
    );

    const cpResponse = await this.#wsClientResponse(client);

    try {
      return validateOCPP(
        remoteStopTransactionResSchema,
        cpResponse[2],
        OCPPActions.REMOTE_STOP_TRANSACTION,
      );
    } catch (error) {
      this.#handleOcppErr(error, client, cpResponse[1]);

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

    client.send(
      JSON.stringify([
        OCPPMessageType.CALL_RESULT,
        randomUUID(),
        OCPPActions.RESET,
        validatedPayload.data,
      ] as OCPPIncomingRequest),
    );

    const cpResponse = await this.#wsClientResponse(client);

    try {
      return validateOCPP(resetResSchema, cpResponse[2], OCPPActions.RESET);
    } catch (error) {
      this.#handleOcppErr(error, client, cpResponse[1]);

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
      JSON.stringify([
        OCPPMessageType.CALL_RESULT,
        randomUUID(),
        OCPPActions.UNLOCK_CONNECTOR,
        validatedPayload.data,
      ] as OCPPIncomingRequest),
    );

    const cpResponse = await this.#wsClientResponse(client);

    try {
      return validateOCPP(
        unlockConnectorResSchema,
        cpResponse[2],
        OCPPActions.UNLOCK_CONNECTOR,
      );
    } catch (error) {
      this.#handleOcppErr(error, client, cpResponse[1]);

      throw new RestError(500, 'Internal server error');
    }
  }
}
