import { db } from 'app/db';
import { logger } from 'app/logger';
import { ocppController } from 'controllers/index';
import { chargeboxes } from 'db/schema';
import { eq } from 'drizzle-orm';
import { IncomingMessage } from 'http';
import internal from 'stream';
import { WssRoute } from 'types/server';
import { urlToClientId } from 'utils/ocppUtil';
import { abortHandshake } from 'utils/wsUtil';

const ocppRoute = new RegExp(`^${WssRoute.OCPP16}/(?:([^/]+?))$`);
export async function wsMiddleware(
  request: IncomingMessage,
  socket: internal.Duplex,
  head: Buffer,
) {
  // Check url route, if not match abort the handshake
  const url = request.url ?? '';
  if (!ocppRoute.test(url)) {
    abortHandshake(socket, 404);
    return;
  }

  // Check if the charge point identifier exists in the database
  const cpIdentifier = await db
    .select({ identifier: chargeboxes.identifier })
    .from(chargeboxes)
    .where(eq(chargeboxes.identifier, urlToClientId(url)));

  if (cpIdentifier.length === 1) {
    ocppController.handleUpgrade(request, socket, head);
    logger.info(
      `WebSocket connection established with ${cpIdentifier[0].identifier}`,
      { module: 'wsMiddleware' },
    );
  } else {
    abortHandshake(socket, 404);
  }
}
