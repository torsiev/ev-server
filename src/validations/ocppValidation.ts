import z from 'zod';

// --------------------------------------
// Defines OCPP request payload validation schema
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
  connectorId: z.number(),
  transactionId: z.number().optional(),
  meterValue: z.array(
    z.object({
      timestamp: z.coerce.date(),
      sampledValue: z.array(sampledValueSchema),
    }),
  ),
});

export const startTransactionSchema = z
  .object({
    connectorId: z.number(),
    meterStart: z.number(),
    reservationId: z.number().optional(),
    timestamp: z.coerce.date(),
  })
  .merge(authorizeSchema);

export const statusNotifSchema = z.object({
  connectorId: z.number(),
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
    meterStop: z.number(),
    timestamp: z.coerce.date(),
    transactionId: z.number(),
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
