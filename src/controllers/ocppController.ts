import { IncomingMessage } from 'http';
import { Duplex } from 'stream';
import { RawData, WebSocket } from 'ws';
import { logger } from 'app/logger';
import {
  OCPPActions,
  OCPPErrorType,
  OCPPIncomingRequest,
  OCPPMessageType,
} from 'types/ocpp/ocppCommon';
import { WssProtocol } from 'types/server';
import { OCPPError, getClientId } from 'utils/ocppUtil';
import { abortHandshake } from 'utils/wsUtil';
import WebSocketController from 'controllers/webSocketController';

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
    try {
      const message: OCPPIncomingRequest = JSON.parse(data.toString());
      if (message[0] === OCPPMessageType.CALL) {
        const action = message[2];
        //TODO: handle response
        switch (action) {
          case OCPPActions.AUTHORIZE:
            break;
          case OCPPActions.BOOT_NOTIFICATION:
            logger.info(data.toString(), { service: this.className });
            break;
          case OCPPActions.DATA_TRANSFER:
            break;
          case OCPPActions.DIAGNOSTICS_STATUS_NOTIF:
            break;
          case OCPPActions.FIRMWARE_STATUS_NOTIF:
            break;
          case OCPPActions.HEARTBEAT:
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
      }
    } catch (error) {
      if (typeof error === 'string') {
        logger.error(error, { service: this.className });
      } else if (error instanceof OCPPError) {
        logger.error(`${error.name}: ${error.message}`, {
          service: this.className,
        });
        if (ws.readyState !== WebSocket.CLOSED) {
          //TODO: send error response
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

  //TODO: Create response handler function
}
