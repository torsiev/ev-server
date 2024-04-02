import z from 'zod';

// --------------------------------------
// Defines OCPP client request payload validation schema
// --------------------------------------
const sampledValueSchema = z.object({
  value: z.string().min(1),
  context: z
    .enum([
      'Interruption.Begin',
      'Interruption.End',
      'Sample.Clock',
      'Sample.Periodic',
      'Transaction.Begin',
      'Transaction.End',
      'Trigger',
      'Other',
    ])
    .optional(),
  format: z.enum(['Raw', 'SignedData']).optional(),
  measurand: z
    .enum([
      'Energy.Active.Export.Register',
      'Energy.Active.Import.Register',
      'Energy.Reactive.Export.Register',
      'Energy.Reactive.Import.Register',
      'Energy.Active.Export.Interval',
      'Energy.Active.Import.Interval',
      'Energy.Reactive.Export.Interval',
      'Energy.Reactive.Import.Interval',
      'Power.Active.Export',
      'Power.Active.Import',
      'Power.Offered',
      'Power.Reactive.Export',
      'Power.Reactive.Import',
      'Power.Factor',
      'Current.Import',
      'Current.Export',
      'Current.Offered',
      'Voltage',
      'Frequency',
      'Temperature',
      'SoC',
      'RPM',
    ])
    .optional(),
  phase: z
    .enum([
      'L1',
      'L2',
      'L3',
      'N',
      'L1-N',
      'L2-N',
      'L3-N',
      'L1-L2',
      'L2-L3',
      'L3-L1',
    ])
    .optional(),
  location: z.enum(['Cable', 'EV', 'Inlet', 'Outlet', 'Body']).optional(),
  unit: z
    .enum([
      'Wh',
      'kWh',
      'varh',
      'kvarh',
      'W',
      'kW',
      'VA',
      'kVA',
      'var',
      'kvar',
      'A',
      'V',
      'K',
      'Celcius',
      'Celsius',
      'Fahrenheit',
      'Percent',
    ])
    .optional(),
});

export const authorizeSchema = z.object({
  idTag: z.string().min(1).max(20),
});

export const bootNotificationSchema = z.object({
  chargePointVendor: z.string().min(1).max(20),
  chargePointModel: z.string().min(1).max(20),
  chargePointSerialNumber: z.string().min(1).max(25).optional(),
  chargeBoxSerialNumber: z.string().min(1).max(25).optional(),
  firmwareVersion: z.string().min(1).max(50).optional(),
  iccid: z.string().min(1).max(20).optional(),
  imsi: z.string().min(1).max(20).optional(),
  meterType: z.string().min(1).max(25).optional(),
  meterSerialNumber: z.string().min(1).max(25).optional(),
});

export const dataTransferSchema = z.object({
  vendorId: z.string().min(1).max(255),
  messageId: z.string().min(1).max(50).optional(),
  data: z.string().min(1).optional(),
});

export const diagnosticStatusNotifSchema = z.object({
  status: z.enum(['Idle', 'Uploaded', 'UploadFailed', 'Uploading']),
});

export const firmwareStatusNotifSchema = z.object({
  status: z.enum([
    'Downloaded',
    'DownloadFailed',
    'Downloading',
    'Idle',
    'InstallationFailed',
    'Installing',
    'Installed',
  ]),
});

export const heartbeatSchema = z.object({});

export const meterValuesSchema = z.object({
  connectorId: z.number().int().nonnegative(),
  transactionId: z.number().int().nonnegative().optional(),
  meterValue: z.array(
    z.object({
      timestamp: z.coerce.date(),
      sampledValue: z.array(sampledValueSchema),
    }),
  ),
});

export const startTransactionSchema = z
  .object({
    connectorId: z.number().int().nonnegative(),
    meterStart: z.number().int().nonnegative(),
    reservationId: z.number().int().nonnegative().optional(),
    timestamp: z.coerce.date(),
  })
  .merge(authorizeSchema);

export const statusNotifSchema = z.object({
  connectorId: z.number().int().nonnegative(),
  errorCode: z.enum([
    'ConnectorLockFailure',
    'EVCommunicationError',
    'GroundFailure',
    'HighTemperature',
    'InternalError',
    'LocalListConflict',
    'NoError',
    'OtherError',
    'OverCurrentFailure',
    'PowerMeterFailure',
    'PowerSwitchFailure',
    'ReaderFailure',
    'ResetFailure',
    'UnderVoltage',
    'OverVoltage',
    'WeakSignal',
  ]),
  info: z.string().min(1).max(50).optional(),
  status: z.enum([
    'Available',
    'Preparing',
    'Charging',
    'SuspendedEVSE',
    'SuspendedEV',
    'Finishing',
    'Reserved',
    'Unavailable',
    'Faulted',
  ]),
  timestamp: z.coerce.date().optional(),
  vendorId: z.string().min(1).max(255).optional(),
  vendorErrorCode: z.string().min(1).max(50).optional(),
});

export const stopTransactionSchema = z
  .object({
    meterStop: z.number().int().nonnegative(),
    timestamp: z.coerce.date(),
    transactionId: z.number().int().nonnegative(),
    reason: z
      .enum([
        'EmergencyStop',
        'EVDisconnected',
        'HardReset',
        'Local',
        'Other',
        'PowerLoss',
        'Reboot',
        'Remote',
        'SoftReset',
        'UnlockCommand',
        'DeAuthorized',
      ])
      .optional(),
    transactionData: z
      .array(
        z.object({
          timestamp: z.coerce.date(),
          sampledValue: z.array(sampledValueSchema),
        }),
      )
      .optional(),
  })
  .merge(authorizeSchema.partial());

// -----------------------------------------------------
// Define OCPP client payload validation schema
// -----------------------------------------------------

export const cancelReservationReqSchema = z.object({
  reservationId: z.number().int().nonnegative(),
});

export const cancelReservationResSchema = z.object({
  status: z.enum(['Accepted', 'Rejected']),
});

export const changeAvailabilityReqSchema = z.object({
  connectorId: z.number().int().nonnegative(),
  type: z.enum(['Inoperative', 'Operative']),
});

export const changeAvailabilityResSchema = z.object({
  status: z.enum(['Accepted', 'Rejected', 'Scheduled']),
});

export const changeConfigReqSchema = z.object({
  key: z.string().min(1).max(50),
  value: z.string().min(1).max(500),
});

export const changeConfigResSchema = z.object({
  status: z.enum(['Accepted', 'Rejected', 'RebootRequired', 'NotSupported']),
});

export const clearCacheReqSchema = z.object({});

export const clearCacheResSchema = z.object({
  status: z.enum(['Accepted', 'Rejected']),
});

export const clearChargingProfileReqSchema = z
  .object({
    id: z.number().int().nonnegative(),
    connectorId: z.number().int().nonnegative(),
    chargingProfilePurpose: z.enum([
      'ChargePointMaxProfile',
      'TxDefaultProfile',
      'TxProfile',
    ]),
  })
  .partial();

export const clearChargingProfileResSchema = z.object({
  status: z.enum(['Accepted', 'Unknown']),
});

export const dataTransferReqSchema = z.object({
  vendorId: z.string().min(1).max(255),
  messageId: z.string().min(1).max(50).optional(),
  data: z.string().optional(),
});

export const dataTransferResSchema = z.object({
  status: z.enum([
    'Accepted',
    'Rejected',
    'UnknownMessageId',
    'UnknownVendorId',
  ]),
  data: z.string().min(1).optional(),
});

export const getCompositeScheduleReqSchema = z.object({
  connectorId: z.number().int().nonnegative(),
  duration: z.number().int().nonnegative(),
  chargingRateUnit: z.enum(['A', 'W']).optional(),
});

export const getCompositeScheduleResSchema = z.object({
  status: z.enum(['Accepted', 'Rejected']),
  connectorId: z.number().int().nonnegative().optional(),
  scheduleStart: z.coerce.date().optional(),
  chargingSchedule: z
    .object({
      duration: z.number().int().nonnegative().optional(),
      startSchedule: z.coerce.date().optional(),
      chargingRateUnit: z.enum(['A', 'W']),
      chargingSchedulePeriod: z.array(
        z.object({
          startPeriod: z.number().int().nonnegative(),
          limit: z.number().multipleOf(0.1),
          numberPhases: z.number().int().nonnegative().optional(),
        }),
      ),
    })
    .optional(),
});

export const getConfigReqSchema = z
  .object({
    key: z.array(z.string().min(1).max(50)),
  })
  .partial();

export const getConfigResSchema = z
  .object({
    configurationKey: z.array(
      z.object({
        key: z.string().min(1).max(50),
        readonly: z.boolean(),
        value: z.string().min(1).max(500).optional(),
      }),
    ),
    unknownKey: z.array(z.string().min(1).max(50)),
  })
  .partial();

export const getDiagnosticsReqSchema = z.object({
  location: z.string(),
  retries: z.number().int().nonnegative().optional(),
  retryInterval: z.number().int().nonnegative().optional(),
  startTime: z.coerce.date().optional(),
  stoptTime: z.coerce.date().optional(),
});

export const getDiagnosticsResSchema = z
  .object({
    fileName: z.string().min(1).max(255),
  })
  .partial();

export const getLocalListVersionReqSchema = z.object({});

export const getLocalListVersionResSchema = z.object({
  listVersion: z.number().int().nonnegative(),
});

export const remoteStartTransactionReqSchema = z.object({
  connectorId: z.number().int().nonnegative().optional(),
  idTag: z.string().min(1).max(20),
  chargingProfile: z
    .object({
      chargingProfileId: z.number().int().nonnegative(),
      transactionId: z.number().int().nonnegative().optional(),
      stackLevel: z.number().int().nonnegative(),
      chargingProfilePurpose: z.enum([
        'ChargePointMaxProfile',
        'TxDefaultProfile',
        'TxProfile',
      ]),
      chargingProfileKind: z.enum(['Absolute', 'Recurring', 'Relative']),
      recurencyKind: z.enum(['Daily', 'Weekly']).optional(),
      validFrom: z.coerce.date().optional(),
      validTo: z.coerce.date().optional(),
      chargingSchedule: z.object({
        duration: z.number().int().nonnegative().optional(),
        startShedule: z.coerce.date().optional(),
        chargingRateUnit: z.enum(['A', 'W']),
        chargingSchedulePeriod: z.array(
          z.object({
            startPeriod: z.number().int().nonnegative(),
            limit: z.number().multipleOf(0.1),
            numberPhase: z.number().int().nonnegative().optional(),
          }),
        ),
        minChargingRate: z.number().multipleOf(0.1),
      }),
    })
    .optional(),
});

export const remoteStartTransactionResSchema = z.object({
  status: z.enum(['Accepted', 'Rejected']),
});

export const remoteStopTransactionReqSchema = z.object({
  transactionId: z.number().int().nonnegative(),
});

export const remoteStopTransactionResSchema = z.object({
  status: z.enum(['Accepted', 'Rejected']),
});

export const reserveNowReqSchema = z.object({
  connectorId: z.number().int().nonnegative(),
  expiryDate: z.coerce.date(),
  idTag: z.string().min(1).max(20),
  parentIdTag: z.string().min(1).max(20).optional(),
  reservationId: z.number().int().nonnegative(),
});

export const reserveNowResSchema = z.object({
  status: z.enum([
    'Accepted',
    'Faulted',
    'Occupied',
    'Rejected',
    'unavailable',
  ]),
});

export const resetReqSchema = z.object({
  type: z.enum(['Hard', 'Soft']),
});

export const resetResSchema = z.object({
  status: z.enum(['Accepted', 'Rejected']),
});

export const sendLocalListReqSchema = z.object({
  listVersion: z.number().int().nonnegative(),
  localAuthorizationList: z
    .array(
      z.object({
        idTag: z.string().min(1).max(50),
        idTagInfo: z
          .object({
            expiryDate: z.coerce.date().optional(),
            parentId: z.string().min(1).max(20).optional(),
            status: z.enum([
              'Accepted',
              'Blocked',
              'Expired',
              'Invalid',
              'ConcurrentTx',
            ]),
          })
          .optional(),
      }),
    )
    .optional(),
  updateType: z.enum(['Differential', 'Full']),
});

export const sendLocalListResSchema = z.object({
  status: z.enum(['Accepted', 'Failed', 'NotSupported', 'VersionMismatch']),
});

export const setChargingProfileReqSchema = z.object({
  connectionId: z.number().int().nonnegative(),
  csChargingProfiles: z.object({
    chargingProfileId: z.number().int().nonnegative(),
    transcationId: z.number().int().nonnegative().optional(),
    stackLevel: z.number().int().nonnegative(),
    chargingProfilePurpose: z.enum([
      'ChargePointMaxProfile',
      'TxDefaultProfile',
      'TxProfile',
    ]),
    chargingProfileKind: z.enum(['Absolute', 'Recurring', 'Relative']),
    reccurencyKind: z.enum(['Daily', 'Weekly']).optional(),
    validFrom: z.coerce.date().optional(),
    validTo: z.coerce.date().optional(),
    chargingSchedule: z.object({
      duration: z.number().int().nonnegative().optional(),
      startSchedule: z.coerce.date().optional(),
      chargingRateUnit: z.enum(['A', 'W']),
      chargingSchedulePeriod: z.array(
        z.object({
          startPeriod: z.number().int().nonnegative(),
          limit: z.number().multipleOf(0.1),
          numberPhases: z.number().int().nonnegative().optional(),
        }),
      ),
      minChargingRate: z.number().multipleOf(0.1).optional(),
    }),
  }),
});

export const setChargingProfileResSchema = z.object({
  status: z.enum(['Accepted', 'Rejected', 'NotSupported']),
});

export const triggerMessageReqSchema = z.object({
  requestedMessage: z.enum([
    'BootNotification',
    'DiagnosticsStatusNotification',
    'FirmwareStatusNotification',
    'Heartbeat',
    'MeterValues',
    'StatusNotification',
  ]),
  connectorId: z.number().int().nonnegative().optional(),
});

export const triggerMessageResSchema = z.object({
  status: z.enum(['Accepted', 'Rejected', 'NotImplemented']),
});

export const unlockConnectorReqSchema = z.object({
  connectorId: z.number().int().nonnegative(),
});

export const unlockConnectorResSchema = z.object({
  status: z.enum(['Unlocked', 'UnlockFailed', 'NotSupported']),
});

export const updateFirmwareReqSchema = z.object({
  location: z.string(),
  retries: z.number().int().nonnegative().optional(),
  retrieveData: z.coerce.date(),
  retrieveInterval: z.number().int().nonnegative().optional(),
});

export const updateFirmwareResSchema = z.object({});
