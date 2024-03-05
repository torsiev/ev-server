// ---------------------------------------
// Infer type from occpp validation schema
// ---------------------------------------

import z from 'zod';
import {
  authorizeSchema,
  bootNotificationSchema,
  heartbeatSchema,
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

export type HeartbeatRequest = z.infer<typeof heartbeatSchema>;

export type HeartbeatResponse = {
  currentTime: Date;
};
