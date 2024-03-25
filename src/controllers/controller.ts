// ------------------------------------------------------------------
// This file defines all controller instances and exports them so
// they can be accessed from other packages.
// -------------------------------------------------------------------

import OcppClientService from 'services/ocppClientService';
import OcppController from './ocppController';

export const ocppController = new OcppController(new OcppClientService());
