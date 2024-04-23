import {
  decimal,
  int,
  mysqlTable,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';
import { addresses } from './addresses';
import { relations } from 'drizzle-orm';
import { connectors } from './connectors';

export const chargeboxes = mysqlTable('chargeboxes', {
  id: int('id', { unsigned: true }).autoincrement().primaryKey(),
  identifier: varchar('identifier', { length: 255 }).notNull(),
  ocppProtocol: varchar('ocpp_protocol', { length: 255 }),
  chargePointVendor: varchar('charge_point_vendor', { length: 255 }),
  chargePointModel: varchar('charge_point_model', { length: 255 }),
  chargePointSerialNumber: varchar('charge_point_serial_number', {
    length: 255,
  }),
  chargeBoxSerialNumber: varchar('charge_box_serial_number', { length: 255 }),
  firmwareVersion: varchar('firmware_version', { length: 255 }),
  firmwareUpdateStatus: varchar('firmware_update_status', { length: 255 }),
  firmwareUpdateTimestamp: timestamp('firwmare_update_timestamp', {
    mode: 'date',
    fsp: 6,
  }),
  iccid: varchar('iccid', { length: 255 }),
  imsi: varchar('imsi', { length: 255 }),
  meterType: varchar('meter_type', { length: 255 }),
  meterSerialNumber: varchar('meter_serial_number', { length: 255 }),
  lastHeartbeat: timestamp('last_heartbeat', { mode: 'date', fsp: 6 }),
  diagnosticsStatus: varchar('diagnostics_status', { length: 255 }),
  diagnosticsTimestamp: timestamp('diagnostics_timestamp', {
    mode: 'date',
    fsp: 6,
  }),
  addressId: int('address_id', { unsigned: true }).references(
    () => addresses.id,
  ),
  locationLatitude: decimal('location_latitude', { precision: 11, scale: 8 }),
  locationLongitude: decimal('location_longitude', { precision: 11, scale: 8 }),
});

export const chargeboxesRelations = relations(chargeboxes, ({ one, many }) => ({
  address: one(addresses, {
    fields: [chargeboxes.addressId],
    references: [addresses.id],
  }),
  connectors: many(connectors),
}));
