import { ocppController } from 'controllers/index';
import express from 'express';

export const apiRouter = express.Router();
const BASE_URL = '/central-system/clients';

apiRouter.get(BASE_URL, ocppController.getClientsId);

apiRouter.post(
  BASE_URL + '/:id/change-availability',
  ocppController.changeAvailability,
);

apiRouter.post(
  BASE_URL + '/:id/change-configuration',
  ocppController.changeConfiguration,
);

apiRouter.post(BASE_URL + '/:id/clear-cache', ocppController.clearCache);

apiRouter.post(
  BASE_URL + '/:id/get-configuration',
  ocppController.getConfiguration,
);

apiRouter.post(
  BASE_URL + '/:id/start-transaction',
  ocppController.remoteStartTransaction,
);

apiRouter.post(
  BASE_URL + '/:id/stop-transaction',
  ocppController.remoteStopTransaction,
);

apiRouter.post(BASE_URL + '/:id/reset', ocppController.reset);

apiRouter.post(
  BASE_URL + '/:id/trigger-message',
  ocppController.triggerMessage,
);

apiRouter.post(
  BASE_URL + '/:id/unlock-connector',
  ocppController.unlockConnector,
);
