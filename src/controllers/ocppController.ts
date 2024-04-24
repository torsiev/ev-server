import { logger } from 'app/logger';
import WebSocketController from 'controllers/webSocketController';
import type { NextFunction, Request, Response } from 'express';
import { IncomingMessage } from 'http';
import OcppClientService from 'services/ocppClientService';
import OcppServerService from 'services/ocppServerService';
import { Duplex } from 'stream';
import {
  OCPPActions,
  OCPPErrorResponse,
  OCPPErrorType,
  OCPPMessageType,
  OCPPRequest,
  OCPPResponse,
} from 'types/ocpp/ocppCommon';
import { WssProtocol } from 'types/server';
import { OCPPError, logOCPPError, urlToClientId } from 'utils/ocppUtil';
import { RestError } from 'utils/restError';
import { abortHandshake } from 'utils/wsUtil';
import { RawData, WebSocket } from 'ws';

export default class OcppController extends WebSocketController<WebSocket> {
  #ocppClientService: OcppClientService;
  #ocppServerService: OcppServerService;

  constructor(
    ocppClientService: OcppClientService,
    ocppServerService: OcppServerService,
  ) {
    super({
      noServer: true,
      handleProtocols(protocols) {
        return protocols.has(WssProtocol.OCPP16) ? WssProtocol.OCPP16 : false;
      },
    });

    this.#ocppClientService = ocppClientService;
    this.#ocppServerService = ocppServerService;
  }

  handleUpgrade(request: IncomingMessage, socket: Duplex, head: Buffer): void {
    const protocols = request.headers['sec-websocket-protocol'];

    if (!protocols?.includes(WssProtocol.OCPP16)) {
      abortHandshake(socket, 400, "Server doesn't support given subprotocol");
      return;
    }

    this.wss.handleUpgrade(request, socket, head, (ws, req) => {
      this.addClient(urlToClientId(req.url), ws);
      this.wss.emit('connection', ws, req);
    });
  }

  protected onOpen(): void {}

  protected async onMessage(
    ws: WebSocket,
    request: IncomingMessage,
    data: RawData,
  ) {
    let message: OCPPRequest | OCPPResponse;
    try {
      message = JSON.parse(data.toString());
      let responseData: Record<string, unknown> | undefined = undefined;

      // Check if message is outgoing response from charging station
      // This will be handled by the ocppServerService
      if (
        message[0] === OCPPMessageType.CALL_RESULT ||
        message[0] === OCPPMessageType.CALL_ERROR
      )
        return;

      // Check if message is incoming request from charging station
      if (message[0] !== OCPPMessageType.CALL) {
        throw new OCPPError(
          OCPPErrorType.FORMATION_VIOLATION,
          'Payload for Action is syntactically incorrect',
        );
      }

      const action = message[2];
      const clientId = urlToClientId(request.url);
      switch (action) {
        case OCPPActions.AUTHORIZE: {
          const response = await this.#ocppClientService.authorize(
            clientId,
            message[3],
          );
          ws.send(this.#buildResponse(message[1], response));
          break;
        }
        case OCPPActions.BOOT_NOTIFICATION: {
          const bootNotifRes = await this.#ocppClientService.bootNotification(
            clientId,
            message[3],
          );
          const response = this.#buildResponse(message[1], bootNotifRes);
          if (bootNotifRes.status === 'Rejected') {
            ws.send(response);
            ws.close(1011);
          }
          ws.send(response);
          break;
        }
        case OCPPActions.DATA_TRANSFER: {
          const response = this.#ocppClientService.dataTransfer(
            clientId,
            message[3],
          );
          ws.send(this.#buildResponse(message[1], response));
          break;
        }
        case OCPPActions.DIAGNOSTICS_STATUS_NOTIF:
          responseData = this.#ocppClientService.diagnosticsStatusNotif(
            clientId,
            message[3],
          );
          break;
        case OCPPActions.FIRMWARE_STATUS_NOTIF:
          responseData = this.#ocppClientService.firmwareStatusNotif(
            clientId,
            message[3],
          );
          break;
        case OCPPActions.HEARTBEAT:
          responseData = this.#ocppClientService.heartbeat(
            clientId,
            message[3],
          );
          break;
        case OCPPActions.METER_VALUES: {
          const response = await this.#ocppClientService.meterValues(
            clientId,
            message[3],
          );
          ws.send(this.#buildResponse(message[1], response));
          break;
        }
        case OCPPActions.START_TRANSACTION: {
          const response = await this.#ocppClientService.startTransaction(
            clientId,
            message[3],
          );
          ws.send(this.#buildResponse(message[1], response));
          break;
        }
        case OCPPActions.STATUS_NOTIFICATION: {
          const response = await this.#ocppClientService.statusNotif(
            clientId,
            message[3],
          );
          ws.send(this.#buildResponse(message[1], response));
          break;
        }
        case OCPPActions.STOP_TRANSACTION: {
          const response = await this.#ocppClientService.stopTransaction(
            clientId,
            message[3],
          );
          ws.send(this.#buildResponse(message[1], response));
          break;
        }
        default:
          throw new OCPPError(
            OCPPErrorType.NOT_IMPLEMENTED,
            `Requested action: ${action} is unknown`,
          );
      }
      // Send response to client
      if (responseData) {
        const res: OCPPResponse = [
          OCPPMessageType.CALL_RESULT,
          message[1],
          responseData,
        ];
        ws.send(JSON.stringify(res));
      }
    } catch (error) {
      // Catch unhandled errors from ocppClientService
      if (error instanceof OCPPError) {
        logOCPPError(
          this.className,
          urlToClientId(request.url),
          error.code,
          error.message,
          error.action,
        );
        // Send error response to client
        if (ws.readyState !== WebSocket.CLOSED) {
          const err: OCPPErrorResponse = [
            OCPPMessageType.CALL_ERROR,
            message![1],
            error.code,
            error.message,
            error.details,
          ];
          ws.send(JSON.stringify(err));
        }
      } else if (error instanceof Error) {
        logger.error(error.message, { service: this.className });
        if (ws.readyState !== WebSocket.CLOSED) {
          ws.terminate();
        }
      }
    }
  }

  protected onError(request: IncomingMessage, err: Error): void {
    logger.error(err.message, { service: this.className });
  }

  protected onPing(): void {
    logger.info('ping', { service: this.className });
  }

  protected onPong(): void {
    logger.info('pong', { service: this.className });
  }

  protected onClose(
    request: IncomingMessage,
    code: number,
    reason: Buffer,
  ): void {
    this.removeClient(urlToClientId(request.url));
    logger.info(
      `Connection with ${urlToClientId(request.url)} disconnected ${code} ${reason}`,
      {
        service: this.className,
      },
    );
  }

  #buildResponse(messageId: string, payload: Record<string, unknown>): string {
    return JSON.stringify([OCPPMessageType.CALL_RESULT, messageId, payload]);
  }

  get getClientsId() {
    return (req: Request, res: Response) => {
      const id = Array.from(this.clients.keys());
      res.send(id);
    };
  }

  getClientWs(id: string) {
    const client = this.clients.get(id);
    if (!client) {
      throw new RestError(404, 'Client not found');
    }

    return client;
  }

  get changeAvailability() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const ws = this.getClientWs(req.params.id);

        const response = await this.#ocppServerService.changeAvailability(
          ws,
          req.body,
        );
        res.json(response);
      } catch (error) {
        next(error);
      }
    };
  }

  get changeConfiguration() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const ws = this.getClientWs(req.params.id);

        const response = await this.#ocppServerService.changeConfiguration(
          ws,
          req.body,
        );
        res.json(response);
      } catch (error) {
        next(error);
      }
    };
  }

  get clearCache() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const ws = this.getClientWs(req.params.id);

        const response = await this.#ocppServerService.clearCache(ws, req.body);
        res.json(response);
      } catch (error) {
        next(error);
      }
    };
  }

  get getConfiguration() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const ws = this.getClientWs(req.params.id);

        const response = await this.#ocppServerService.getConfiguration(
          ws,
          req.body,
        );
        res.json(response);
      } catch (error) {
        next(error);
      }
    };
  }

  get remoteStartTransaction() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const ws = this.getClientWs(req.params.id);

        const response = await this.#ocppServerService.remoteStartTransaction(
          ws,
          req.body,
        );
        res.json(response);
      } catch (error) {
        next(error);
      }
    };
  }

  get remoteStopTransaction() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const ws = this.getClientWs(req.params.id);

        const response = await this.#ocppServerService.remoteStopTransaction(
          ws,
          req.body,
        );
        res.json(response);
      } catch (error) {
        next(error);
      }
    };
  }

  get reset() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const ws = this.getClientWs(req.params.id);

        const response = await this.#ocppServerService.reset(ws, req.body);
        res.json(response);
      } catch (error) {
        next(error);
      }
    };
  }

  get unlockConnector() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const ws = this.getClientWs(req.params.id);

        const response = await this.#ocppServerService.unlockConnector(
          ws,
          req.body,
        );
        res.json(response);
      } catch (error) {
        next(error);
      }
    };
  }
}
