import { IncomingMessage } from 'http';
import { Duplex } from 'stream';
import { RawData } from 'ws';
import { logger } from '../config/logger';
import { WssProtocol } from '../types/server';
import { abortHandshake } from '../utils/wsUtil';
import WebSocketService from './websocketService';

export default class OcppService extends WebSocketService {
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

    this.wss.handleUpgrade(request, socket, head, (ws, req) => {
      this.wss.emit('connection', ws, req);
    });
  }

  protected onOpen(): void {}

  protected async onMessage(data: RawData) {
    //TODO: handle ocpp1.6 core request types and response types
    logger.info(data.toString(), { service: this.className });
  }

  protected onError(err: Error): void {
    logger.error(err.message, { service: this.className });
  }

  protected onPing(): void {
    logger.info('ping', { service: this.className });
  }

  protected onPong(): void {
    logger.info('pong', { service: this.className });
  }

  protected onClose(code: number, reason: Buffer): void {
    logger.info(`Connection disconnected ${code} ${reason}`, {
      service: this.className,
    });
  }
}
