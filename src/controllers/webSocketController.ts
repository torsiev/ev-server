import { IncomingMessage } from 'http';
import internal from 'stream';
import { RawData, ServerOptions, WebSocketServer, WebSocket } from 'ws';

export default abstract class WebSocketController {
  private wss: WebSocketServer;
  readonly className = this.constructor.name;

  constructor(options?: ServerOptions) {
    this.wss = new WebSocketServer(options);

    this.wss.on('connection', (ws, req) => {
      ws.on('open', () => this.onOpen());
      ws.on('message', async (data, isBinary) => {
        await this.onMessage(ws, req, data, isBinary);
      });
      ws.on('error', (err) => this.onError(req, err));
      ws.on('ping', (data) => this.onPing(req, data));
      ws.on('pong', (data) => this.onPong(req, data));
      ws.on('close', (code, reason) => this.onClose(req, code, reason));
    });
  }

  get getWss(): WebSocketServer {
    return this.wss;
  }

  abstract handleUpgrade(
    request: IncomingMessage,
    socket: internal.Duplex,
    head: Buffer,
  ): void;

  protected abstract onOpen(): void;

  protected abstract onMessage(
    ws: WebSocket,
    request: IncomingMessage,
    data: RawData,
    isBinary: boolean,
  ): void;

  protected abstract onError(request: IncomingMessage, err: Error): void;

  protected abstract onPing(request: IncomingMessage, data: Buffer): void;

  protected abstract onPong(request: IncomingMessage, data: Buffer): void;

  protected abstract onClose(
    request: IncomingMessage,
    code: number,
    reason: Buffer,
  ): void;
}
