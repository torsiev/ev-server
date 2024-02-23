import { IncomingMessage } from 'http';
import internal from 'stream';
import { RawData, ServerOptions, WebSocketServer } from 'ws';

export default abstract class WebSocketService {
  protected wss: WebSocketServer;
  readonly className = this.constructor.name;

  constructor(options?: ServerOptions) {
    this.wss = new WebSocketServer(options);

    this.wss.on('connection', (ws) => {
      ws.on('open', () => this.onOpen());
      ws.on('message', async (data, isBinary) => {
        await this.onMessage(data, isBinary);
      });
      ws.on('error', (err) => this.onError(err));
      ws.on('ping', (data) => this.onPing(data));
      ws.on('pong', (data) => this.onPong(data));
      ws.on('close', (code, reason) => this.onClose(code, reason));
    });
  }

  abstract handleUpgrade(
    request: IncomingMessage,
    socket: internal.Duplex,
    head: Buffer,
  ): void;

  protected abstract onOpen(): void;

  protected abstract onMessage(data: RawData, isBinary: boolean): void;

  protected abstract onError(err: Error): void;

  protected abstract onPing(data: Buffer): void;

  protected abstract onPong(data: Buffer): void;

  protected abstract onClose(code: number, reason: Buffer): void;
}
