import { logger } from 'app/logger';
import { web } from 'app/web';
import 'dotenv/config';
import wsRouteHandler from 'routes/wsRouteHandler';

const server = web.listen(process.env.SERVER_PORT, () => {
  logger.info(`Server run on http://localhost:${process.env.SERVER_PORT}`);
});

server.on('upgrade', wsRouteHandler);

export { server };
