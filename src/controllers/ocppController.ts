import { logger } from 'app/logger';
import WebSocketController from 'controllers/webSocketController';
import type { Request, Response } from 'express';
import { IncomingMessage } from 'http';
import OcppClientService from 'services/ocppClientService';
import { Duplex } from 'stream';
import {
  OCPPActions,
  OCPPErrorResponse,
  OCPPErrorType,
  OCPPIncomingRequest,
  OCPPMessageType,
  OCPPOutgoingResponse,
} from 'types/ocpp/ocppCommon';
import { WssProtocol } from 'types/server';
import { OCPPError, logOCPPError, urlToClientId } from 'utils/ocppUtil';
import { abortHandshake } from 'utils/wsUtil';
import { RawData, WebSocket } from 'ws';

export default class OcppController extends WebSocketController {
  #ocppClientService: OcppClientService;

  constructor(ocppClientService: OcppClientService) {
    super({
      noServer: true,
      handleProtocols(protocols) {
        return protocols.has(WssProtocol.OCPP16) ? WssProtocol.OCPP16 : false;
      },
    });

    this.#ocppClientService = ocppClientService;
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
    let message: OCPPIncomingRequest | OCPPOutgoingResponse;
    try {
      message = JSON.parse(data.toString());
      let responseData: Record<string, unknown> | undefined = undefined;

      if (message[0] !== OCPPMessageType.CALL) {
        throw new OCPPError(
          OCPPErrorType.FORMATION_VIOLATION,
          'Payload for Action is syntactically incorrect',
        );
      }

      // Check if message is outgoing response from charging station
      if (message.length === 3) return;

      const action = message[2];
      switch (action) {
        case OCPPActions.AUTHORIZE:
          responseData = this.#ocppClientService.authorize(message[3]);
          break;
        case OCPPActions.BOOT_NOTIFICATION:
          responseData = this.#ocppClientService.bootNotification(message[3]);
          break;
        case OCPPActions.DATA_TRANSFER:
          responseData = this.#ocppClientService.dataTransfer(message[3]);
          break;
        case OCPPActions.DIAGNOSTICS_STATUS_NOTIF:
          responseData = this.#ocppClientService.diagnosticsStatusNotif(
            message[3],
          );
          break;
        case OCPPActions.FIRMWARE_STATUS_NOTIF:
          responseData = this.#ocppClientService.firmwareStatusNotif(
            message[3],
          );
          break;
        case OCPPActions.HEARTBEAT:
          responseData = this.#ocppClientService.heartbeat(message[3]);
          break;
        case OCPPActions.METER_VALUES:
          responseData = this.#ocppClientService.meterValues(message[3]);
          break;
        case OCPPActions.START_TRANSACTION:
          responseData = this.#ocppClientService.startTransaction(message[3]);
          break;
        case OCPPActions.STATUS_NOTIFICATION:
          responseData = this.#ocppClientService.statusNotif(message[3]);
          break;
        case OCPPActions.STOP_TRANSACTION:
          responseData = this.#ocppClientService.stopTransaction(message[3]);
          break;
        default:
          throw new OCPPError(
            OCPPErrorType.NOT_IMPLEMENTED,
            `Requested action: ${action} is unknown`,
          );
      }
      // Send response to client
      if (responseData) {
        const res: OCPPOutgoingResponse = [
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

  get getClientsId() {
    return (req: Request, res: Response) => {
      const id = Array.from(this.clients.keys());
      res.send(id);
    };
  }
}
