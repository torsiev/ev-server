import { IncomingMessage } from 'http';
import internal from 'stream';
import { logger } from '../config/logger';
import OcppService from '../services/ocppService';
import { abortHandshake } from '../utils/wsUtil';
import { WssRoute } from '../types/server';

const service = 'wsRouteHandler';

const ocppService = new OcppService();
const ocppRoute = new RegExp(`^${WssRoute.OCPP16}/(?:([^/]+?))$`);

export default async function wsRouteHandler(
  request: IncomingMessage,
  socket: internal.Duplex,
  head: Buffer,
) {
  try {
    const url = request.url ?? '';
    console.log(url);
    if (ocppRoute.test(url)) {
      ocppService.handleUpgrade(request, socket, head);
    } else {
      abortHandshake(socket, 404);
    }
  } catch (error) {
    abortHandshake(socket, 500);
    logger.error(error as string, { service });
  }
}
