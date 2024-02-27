import { IncomingMessage } from 'http';
import internal from 'stream';
import { logger } from '../app/logger';
import OcppController from '../controllers/ocppController';
import { WssRoute } from '../types/server';
import { abortHandshake } from '../utils/wsUtil';

const service = 'wsRouteHandler';

const ocppController = new OcppController();
const ocppRoute = new RegExp(`^${WssRoute.OCPP16}/(?:([^/]+?))$`);

export default async function wsRouteHandler(
  request: IncomingMessage,
  socket: internal.Duplex,
  head: Buffer,
) {
  try {
    const url = request.url ?? '';

    if (ocppRoute.test(url)) {
      ocppController.handleUpgrade(request, socket, head);
    } else {
      abortHandshake(socket, 404);
    }
  } catch (error) {
    abortHandshake(socket, 500);
    logger.error(error as string, { service });
  }
}
