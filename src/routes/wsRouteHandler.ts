import { IncomingMessage } from 'http';
import internal from 'stream';
import { logger } from '../config/logger';
import OcppService from '../services/ocppService';
import { WssRoute } from '../types/server';
import { abortHandshake } from '../utils/wsUtil';

const service = 'wsRouteHandler';

const ocppService = new OcppService();

export default async function wsRouteHandler(
  request: IncomingMessage,
  socket: internal.Duplex,
  head: Buffer,
) {
  try {
    const url = request.url;
    const { OCPP16 } = WssRoute;

    if (url === OCPP16) {
      ocppService.handleUpgrade(request, socket, head);
    } else {
      abortHandshake(socket, 404);
    }
  } catch (error) {
    abortHandshake(socket, 500);
    logger.error(error as string, { service });
  }
}
