import { logger } from 'app/logger';
import WebSocketController from 'controllers/webSocketController';
import { IncomingMessage } from 'http';
import ocppClientService from 'services/ocppClientService';
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
import { OCPPError, getClientId, logOCPPError } from 'utils/ocppUtil';
import { abortHandshake } from 'utils/wsUtil';
import { RawData, WebSocket } from 'ws';

export default class OcppController extends WebSocketController {
  constructor() {
    super({
      noServer: true,
      handleProtocols(protocols) {
        return protocols.has(WssProtocol.OCPP16) ? WssProtocol.OCPP16 : false;
      },
    });
  }

  handleUpgrade(request: IncomingMessage, socket: Duplex, head: Buffer): void {
    const protocols = request.headers['sec-websocket-protocol'];

    if (!protocols?.includes(WssProtocol.OCPP16)) {
      abortHandshake(socket, 400, "Server doesn't support given subprotocol");
      return;
    }

    this.getWss.handleUpgrade(request, socket, head, (ws, req) => {
      this.getWss.emit('connection', ws, req);
    });
  }

  protected onOpen(): void {}

  protected async onMessage(
    ws: WebSocket,
    request: IncomingMessage,
    data: RawData,
  ) {
    const message: OCPPIncomingRequest = JSON.parse(data.toString());
    let responseData: Record<string, unknown> | undefined = undefined;

    try {
      if (message[0] !== OCPPMessageType.CALL) {
        throw new OCPPError(
          OCPPErrorType.FORMATION_VIOLATION,
          'Payload for Action is syntactically incorrect',
        );
      }

      const action = message[2];
      switch (action) {
        case OCPPActions.AUTHORIZE:
          responseData = ocppClientService.authorize(message[3]);
          break;
        case OCPPActions.BOOT_NOTIFICATION:
          responseData = ocppClientService.bootNotification(message[3]);
          break;
        case OCPPActions.DATA_TRANSFER:
          break;
        case OCPPActions.DIAGNOSTICS_STATUS_NOTIF:
          break;
        case OCPPActions.FIRMWARE_STATUS_NOTIF:
          break;
        case OCPPActions.HEARTBEAT:
          responseData = ocppClientService.heartbeat(message[3]);
          break;
        case OCPPActions.METER_VALUES:
          break;
        case OCPPActions.START_TRANSACTION:
          break;
        case OCPPActions.STATUS_NOTIFICATION:
          break;
        case OCPPActions.STOP_TRANSACTION:
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
          getClientId(request.url),
          error.code,
          error.message,
          error.action,
        );
        // Send error response to client
        if (ws.readyState !== WebSocket.CLOSED) {
          const err: OCPPErrorResponse = [
            OCPPMessageType.CALL_ERROR,
            message[1],
            error.code,
            error.message,
            error.details,
          ];
          ws.send(JSON.stringify(err));
        }
      } else if (error instanceof Error) {
        logger.error(error.message, { service: this.className });
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
    logger.info(
      `Connection with ${getClientId(request.url)} disconnected ${code} ${reason}`,
      {
        service: this.className,
      },
    );
  }
}
