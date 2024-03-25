import { ocppController } from 'controllers/controller';
import express from 'express';

export const apiRouter = express.Router();
const BASE_URL = '/central-system/clients';

apiRouter.get(BASE_URL, ocppController.getClientsId);
