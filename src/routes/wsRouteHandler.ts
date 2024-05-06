import { logger } from 'app/logger';
import { IncomingMessage } from 'http';
import { wsMiddleware } from 'middlewares/ocppWsMiddleware';
import internal from 'stream';
import { abortHandshake } from 'utils/wsUtil';

export default async function wsRouteHandler(
  request: IncomingMessage,
  socket: internal.Duplex,
  head: Buffer,
) {
  try {
    wsMiddleware(request, socket, head);
  } catch (error) {
    abortHandshake(socket, 500);
    logger.error(error as string, { module: 'wsRouteHandler' });
  }
}
