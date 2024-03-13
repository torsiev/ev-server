import express from 'express';
import { apiRouter } from 'routes/api';

export const web = express();

web.use(express.json());
web.use('/api/v1', apiRouter);

web.get('/', (req, res) => {
  res.send({
    data: 'Hello World!',
  });
});
