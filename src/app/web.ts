import express from 'express';
import cors from 'cors';
import { apiRouter } from 'routes/api';
import {
  notFoundMiddleware,
  errorMiddleware,
} from 'middlewares/errorMiddleware';

export const web = express();

web.use(cors());
web.use(express.json());
web.use('/api/v1', apiRouter);

web.get('/', (req, res) => {
  res.send({
    data: 'Hello World!',
  });
});

web.use(notFoundMiddleware);
web.use(errorMiddleware);
