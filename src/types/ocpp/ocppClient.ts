// ---------------------------------------
// Infer type from occpp validation schema
// ---------------------------------------

import z from 'zod';
import {
  authorizeSchema,
  bootNotificationSchema,
  dataTransferSchema,
  diagnosticStatusNotifSchema,
  firmwareStatusNotifSchema,
  heartbeatSchema,
  meterValuesSchema,
  startTransactionSchema,
  statusNotifSchema,
  stopTransactionSchema,
} from 'validations/ocppValidation';

export type AuthorizeRequest = z.infer<typeof authorizeSchema>;

export type AuthorizeResponse = {
  idTagInfo: {
    status: 'Accepted' | 'Blocked' | 'Expired' | 'Invalid' | 'ConcurrentTx';
    expiryDate?: Date;
    parentIdTag?: string;
  };
};

export type BootNotificationRequest = z.infer<typeof bootNotificationSchema>;

export type BootNotificationResponse = {
  status: 'Accepted' | 'Pending' | 'Rejected';
  currentTime: Date;
  interval: number;
};

export type DataTransferRequest = z.infer<typeof dataTransferSchema>;

export type DataTransferResponse = {
  status: 'Accepted' | 'Rejected' | 'UnknownMessageId' | 'UnknownVendorId';
  data?: string;
};

export type DiagnosticsStatusNotifRequest = z.infer<
  typeof diagnosticStatusNotifSchema
>;

export type DiagnosticsStatusNotifResponse = Record<string, never>;

export type FirmwareStatusNotifRequest = z.infer<
  typeof firmwareStatusNotifSchema
>;

export type FirmwareStatusNotifResponse = Record<string, never>;

export type HeartbeatRequest = z.infer<typeof heartbeatSchema>;

export type HeartbeatResponse = {
  currentTime: Date;
};

export type MeterValuesRequest = z.infer<typeof meterValuesSchema>;

export type MeterValuesResponse = Record<string, never>;

export type StartTransactionRequest = z.infer<typeof startTransactionSchema>;

export type StartTransactionResponse = {
  transactionId: number;
  idTagInfo: {
    status: 'Accepted' | 'Blocked' | 'Expired' | 'Invalid' | 'ConcurrentTx';
    expiryDate?: Date;
    parentIdTag?: string;
  };
};

export type StatusNotifRequest = z.infer<typeof statusNotifSchema>;

export type StatusNotifResponse = Record<string, never>;

export type StopTransactionRequest = z.infer<typeof stopTransactionSchema>;

export type StopTransactionResponse = {
  idTagInfo: {
    status: 'Accepted' | 'Blocked' | 'Expired' | 'Invalid' | 'ConcurrentTx';
    expiryDate?: Date;
    parentIdTag?: string;
  };
};
