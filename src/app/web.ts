import express from 'express';

export const web = express();

web.use(express.json());

web.get('/', (req, res) => {
  res.send({
    data: 'Hello World!',
  });
});
