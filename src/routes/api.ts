import { ocppController } from 'controllers/controller';
import express from 'express';

export const apiRouter = express.Router();

apiRouter.get('/central-system/clients', ocppController.getClientsId);
