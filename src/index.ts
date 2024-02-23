import 'dotenv/config';
import express from 'express';
import { logger } from './config/logger';

const app = express();

app.get('/', (req, res) => {
  res.send({
    data: 'Hello World!',
  });
});

const server = app.listen(process.env.SERVER_PORT, () => {
  logger.info(`Server run on http://localhost:${process.env.SERVER_PORT}`);
});

export { server };
