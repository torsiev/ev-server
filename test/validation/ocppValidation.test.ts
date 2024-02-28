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
} from '../../src/validations/ocppValidation';

// --------------------------------------
// OCPP request validation schema unit test
// --------------------------------------

const tooBigErr = 'too_big';
const tooSmallErr = 'too_small';
const invalidErr = 'invalid_type';
const invalidEnumErr = 'invalid_enum_value';

describe('Authorize schema test', () => {
  it('Should pass validation', () => {
    const data = { idTag: 'kO5F2j0q93s2xY7t8mB1' };
    const result = authorizeSchema.parse(data);

    expect(result).toEqual(data);
  });

  it('Should throw error, characters length more than 20', () => {
    const data = { idTag: 'kO5F2j0q93s2xY7t8mB1v' };

    expect(() => {
      authorizeSchema.parse(data);
    }).toThrow(tooBigErr);
  });

  it('Should throw error, Invalid type', () => {
    const data = { idTag: 123 };

    expect(() => {
      authorizeSchema.parse(data);
    }).toThrow(invalidErr);
  });

  it('Should throw error, required properties missing', () => {
    const data = {};

    expect(() => {
      authorizeSchema.parse(data);
    }).toThrow(invalidErr);
  });
});

describe('Boot Notification schema test', () => {
  it('Should pass validation', () => {
    const data = {
      chargePointVendor: 'ABC',
      chargePointModel: 'CP1',
      chargePointSerialNumber: 'abc123',
    };
    const result = bootNotificationSchema.parse(data);

    expect(result).toEqual(data);
  });

  it('Should throw error, value is 0 character', () => {
    const data = {
      chargePointVendor: 'ABC',
      chargePointModel: '',
    };

    expect(() => {
      bootNotificationSchema.parse(data);
    }).toThrow(tooSmallErr);
  });

  it('Should throw error, required properties missing', () => {
    const data = {
      chargePointSerialNumber: 'abc123',
      chargeBoxSerialNumber: 'efg789',
      firmwareVersion: '1.0',
      iccid: 'iccid',
      imsi: 'imsi',
      meterType: 'type',
      meterSerialNumber: '12345689',
    };

    expect(() => bootNotificationSchema.parse(data)).toThrow(invalidErr);
  });

  it('Should throw error, invalid type', () => {
    const data = {
      chargePointVendor: 13,
      chargePointModel: 23,
      chargePointSerialNumber: 123,
      chargeBoxSerialNumber: 123,
      firmwareVersion: 123,
      iccid: 123,
      imsi: 679,
      meterType: 87,
      meterSerialNumber: 43,
    };

    expect(() => bootNotificationSchema.parse(data)).toThrow(invalidErr);
  });
});

describe('Data Transfer schema test', () => {
  it('Should pass validation', () => {
    const data = {
      vendorId: '123ABC',
    };

    expect(dataTransferSchema.parse(data)).toEqual(data);
  });

  it('Should throw error, value is 0 character', () => {
    const data = {
      vendorId: '123ABC',
      messageId: '',
      data: 'secret data',
    };

    expect(() => dataTransferSchema.parse(data)).toThrow(tooSmallErr);
  });

  it('Should throw error, required properties missing', () => {
    const data = {
      messageId: '2',
      data: 'secret data',
    };

    expect(() => dataTransferSchema.parse(data)).toThrow(invalidErr);
  });

  it('Should throw error, invalid type', () => {
    const data = {
      vendorId: 12,
      messageId: 2,
      data: 5,
    };

    expect(() => dataTransferSchema.parse(data)).toThrow(invalidErr);
  });
});

describe('Diagnostic Status Notification schema test', () => {
  it('Should pass validation', () => {
    const data = { status: 'Idle' };

    expect(diagnosticStatusNotifSchema.parse(data)).toEqual(data);
  });

  it('Should throw error, invalid type', () => {
    const data = { status: 123 };

    expect(() => diagnosticStatusNotifSchema.parse(data)).toThrow(invalidErr);
  });

  it('Should throw error, invalid value', () => {
    const data = { status: 'idle' };

    expect(() => diagnosticStatusNotifSchema.parse(data)).toThrow(
      invalidEnumErr,
    );
  });

  it('Should throw error, required properties missing', () => {
    const data = {};

    expect(() => diagnosticStatusNotifSchema.parse(data)).toThrow(invalidErr);
  });
});

describe('Firmware Status Notification schema test', () => {
  it('Should pass validation', () => {
    const data = { status: 'Idle' };

    expect(firmwareStatusNotifSchema.parse(data)).toEqual(data);
  });

  it('Should throw error, invalid type', () => {
    const data = { status: 123 };

    expect(() => firmwareStatusNotifSchema.parse(data)).toThrow(invalidErr);
  });

  it('Should throw error, invalid value', () => {
    const data = { status: 'idle' };

    expect(() => firmwareStatusNotifSchema.parse(data)).toThrow(invalidEnumErr);
  });

  it('Should throw error, required properties missing', () => {
    const data = {};

    expect(() => firmwareStatusNotifSchema.parse(data)).toThrow(invalidErr);
  });
});

describe('Heartbeat schema test', () => {
  it('Should pass validation', () => {
    const data = {};

    expect(heartbeatSchema.parse(data)).toEqual({});
  });
});

describe('Meter Values schema test', () => {
  it('Should pass validation', () => {
    const data = {
      connectorId: 1,
      meterValue: [
        {
          timestamp: '2021-07-01T12:00:00Z',
          sampledValue: [
            {
              value: '100',
              unit: 'Wh',
              context: 'Sample.Periodic',
              measurand: 'Energy.Active.Import.Register',
              phase: 'L1',
              location: 'Outlet',
            },
          ],
        },
      ],
    };

    expect(meterValuesSchema.parse(data)).toEqual({
      ...data,
      meterValue: [
        {
          ...data.meterValue[0],
          timestamp: new Date(data.meterValue[0].timestamp),
        },
      ],
    });
  });

  it('Should throw error, invalid type', () => {
    const data = {
      connectorId: '1',
      meterValue: [
        {
          timestamp: '2021-07-01T12:00:00Z',
          sampledValue: [
            {
              value: 100,
              unit: 'Wh',
              context: 'Sample.Periodic',
              measurand: 'Energy.Active.Import.Register',
              phase: 'L1',
              location: 'Outlet',
            },
          ],
        },
      ],
    };

    expect(() => meterValuesSchema.parse(data)).toThrow(invalidErr);
  });

  it('Should throw error, required properties missing', () => {
    const data = {
      meterValue: [
        {
          timestamp: '2021-07-01T12:00:00Z',
          sampledValue: [
            {
              value: '100',
              unit: 'Wh',
              context: 'Sample.Periodic',
              measurand: 'Energy.Active.Import.Register',
              phase: 'L1',
              location: 'Outlet',
            },
          ],
        },
      ],
    };

    expect(() => meterValuesSchema.parse(data)).toThrow(invalidErr);
  });

  it('Should throw error, invalid enum value', () => {
    const data = {
      connectorId: 1,
      meterValue: [
        {
          timestamp: '2021-07-01T12:00:00Z',
          sampledValue: [
            {
              value: '100',
              unit: 'Wh',
              context: 'Sample.periodic',
              measured: 'Energy.Active.Import.Register',
              phase: 'L1',
              location: 'Outlet',
            },
          ],
        },
      ],
    };

    expect(() => meterValuesSchema.parse(data)).toThrow(invalidEnumErr);
  });
});

describe('Start Transaction schema test', () => {
  it('Should pass validation', () => {
    const data = {
      connectorId: 1,
      idTag: 'kO5F2j0q93s2xY7t8mB1',
      meterStart: 100,
      reservationId: 123,
      timestamp: '2021-07-01T12:00:00Z',
    };

    expect(startTransactionSchema.parse(data)).toEqual({
      ...data,
      timestamp: new Date(data.timestamp),
    });
  });

  it('Should throw error, invalid type', () => {
    const data = {
      connectorId: '1',
      idTag: 'kO5F2j0q93s2xY7t8mB1',
      meterStart: 100,
      reservationId: 123,
      timestamp: '2021-07-01T12:00:00Z',
    };

    expect(() => startTransactionSchema.parse(data)).toThrow(invalidErr);
  });

  it('Should throw error, required properties missing', () => {
    const data = {
      idTag: 'kO5F2j0q93s2xY7t8mB1',
      meterStart: 100,
      reservationId: 123,
      timestamp: '2021-07-01T12:00:00Z',
    };

    expect(() => startTransactionSchema.parse(data)).toThrow(invalidErr);
  });
});

describe('Status Notification schema test', () => {
  it('Should pass validation', () => {
    const data = {
      connectorId: 1,
      errorCode: 'NoError',
      info: 'Connected',
      status: 'Available',
      timestamp: '2021-07-01T12:00:00Z',
    };

    expect(statusNotifSchema.parse(data)).toEqual({
      ...data,
      timestamp: new Date(data.timestamp),
    });
  });

  it('Should throw error, invalid type', () => {
    const data = {
      connectorId: '1',
      errorCode: 'NoError',
      info: 'Connected',
      status: 'Available',
      timestamp: '2021-07-01T12:00:00Z',
    };

    expect(() => statusNotifSchema.parse(data)).toThrow(invalidErr);
  });

  it('Should throw error, required properties missing', () => {
    const data = {
      errorCode: 'NoError',
      info: 'Connected',
      status: 'Available',
      timestamp: '2021-07-01T12:00:00Z',
    };

    expect(() => statusNotifSchema.parse(data)).toThrow(invalidErr);
  });

  it('Should throw error, invalid enum value', () => {
    const data = {
      connectorId: 1,
      errorCode: 'NoError',
      info: 'Connected',
      status: 'available',
      timestamp: '2021-07-01T12:00:00Z',
    };

    expect(() => statusNotifSchema.parse(data)).toThrow(invalidEnumErr);
  });
});

describe('Stop Transaction schema test', () => {
  it('Should pass validation', () => {
    const data = {
      idTag: 'kO5F2j0q93s2xY7t8mB1',
      meterStop: 100,
      timestamp: '2021-07-01T12:00:00Z',
      transactionId: 123,
    };

    expect(stopTransactionSchema.parse(data)).toEqual({
      ...data,
      timestamp: new Date(data.timestamp),
    });
  });

  it('Should throw error, invalid type', () => {
    const data = {
      idTag: 123,
      meterStop: 100,
      timestamp: '2021-07-01T12:00:00Z',
      transactionId: 123,
    };

    expect(() => stopTransactionSchema.parse(data)).toThrow(invalidErr);
  });

  it('Should throw error, required properties missing', () => {
    const data = {
      timestamp: '2021-07-01T12:00:00Z',
      transactionId: 123,
    };

    expect(() => stopTransactionSchema.parse(data)).toThrow(invalidErr);
  });
});
