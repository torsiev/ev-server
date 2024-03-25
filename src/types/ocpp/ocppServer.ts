import {
  cancelReservationResSchema,
  cancelReservationReqSchema,
  changeAvailabilityResSchema,
  changeAvailabilityReqSchema,
  changeConfigResSchema,
  changeConfigReqSchema,
  clearCacheResSchema,
  clearCacheReqSchema,
  clearChargingProfileResSchema,
  clearChargingProfileReqSchema,
  dataTransferResSchema,
  getCompositeScheduleResSchema,
  getCompositeScheduleReqSchema,
  getConfigResSchema,
  getConfigReqSchema,
  getDiagnosticsResSchema,
  getDiagnosticsReqSchema,
  getLocalListVersionResSchema,
  getLocalListVersionReqSchema,
  remoteStartTransactionResSchema,
  remoteStartTransactionReqSchema,
  remoteStopTransactionResSchema,
  remoteStopTransactionReqSchema,
  reserveNowResSchema,
  reserveNowReqSchema,
  resetResSchema,
  sendLocalListResSchema,
  setChargingProfileResSchema,
  triggerMessageResSchema,
  unlockConnectorResSchema,
  unlockConnectorReqSchema,
  updateFirmwareResSchema,
  dataTransferReqSchema,
  resetReqSchema,
  triggerMessageReqSchema,
  updateFirmwareReqSchema,
} from 'validations/ocppValidation';
import z from 'zod';

export type CancelReservationRequest = z.infer<
  typeof cancelReservationReqSchema
>;

export type CancelReservationResponse = z.infer<
  typeof cancelReservationResSchema
>;

export type ChangeAvailabilityRequest = z.infer<
  typeof changeAvailabilityReqSchema
>;

export type ChangeAvailabilityResponse = z.infer<
  typeof changeAvailabilityResSchema
>;

export type ChangeConfigRequest = z.infer<typeof changeConfigReqSchema>;

export type ChangeConfigResponse = z.infer<typeof changeConfigResSchema>;

export type ClearCacheRequest = z.infer<typeof clearCacheReqSchema>;

export type ClearCacheResponse = z.infer<typeof clearCacheResSchema>;

export type ClearChargingProfileRequest = z.infer<
  typeof clearChargingProfileReqSchema
>;

export type ClearChargingProfileResponse = z.infer<
  typeof clearChargingProfileResSchema
>;

export type DataTransferRequest = z.infer<typeof dataTransferReqSchema>;

export type DataTransferResponse = z.infer<typeof dataTransferResSchema>;

export type GetCompositeScheduleRequest = z.infer<
  typeof getCompositeScheduleReqSchema
>;

export type GetCompositeScheduleResponse = z.infer<
  typeof getCompositeScheduleResSchema
>;

//???
export type GetConfigRequest = z.infer<typeof getConfigReqSchema>;

export type GetConfigResponse = z.infer<typeof getConfigResSchema>;

//???
export type GetDiagnosticsRequest = z.infer<typeof getDiagnosticsReqSchema>;

export type GetDiagnosticsResponse = z.infer<typeof getDiagnosticsResSchema>;

export type GetLocalListVersionRequest = z.infer<
  typeof getLocalListVersionReqSchema
>;

export type GetLocalListVersionResponse = z.infer<
  typeof getLocalListVersionResSchema
>;

//???
export type RemoteStartTransactionRequest = z.infer<
  typeof remoteStartTransactionReqSchema
>;

export type RemoteStartTransactionResponse = z.infer<
  typeof remoteStartTransactionResSchema
>;

export type RemoteStopTransactionRequest = z.infer<
  typeof remoteStopTransactionReqSchema
>;

export type RemoteStopTransactionResponse = z.infer<
  typeof remoteStopTransactionResSchema
>;

export type ReserveNowRequest = z.infer<typeof reserveNowReqSchema>;

export type ReserveNowResponse = z.infer<typeof reserveNowResSchema>;

export type ResetRequest = z.infer<typeof resetReqSchema>;

export type ResetResponse = z.infer<typeof resetResSchema>;

//export type SendLocalListRequest={};
export type SendLocalListResponse = z.infer<typeof sendLocalListResSchema>;

//export type SetChargingProfileRequest={};
export type SetChargingProfileResponse = z.infer<
  typeof setChargingProfileResSchema
>;

export type TriggerMessageRequest = z.infer<typeof triggerMessageReqSchema>;

export type TriggerMessageResponse = z.infer<typeof triggerMessageResSchema>;

export type UnlockConnectorRequest = z.infer<typeof unlockConnectorReqSchema>;

export type UnlockConnectorResponse = z.infer<typeof unlockConnectorResSchema>;

export type UpdateFirmwareRequest = z.infer<typeof updateFirmwareReqSchema>;

export type UpdateFirmwareResponse = z.infer<typeof updateFirmwareResSchema>;
