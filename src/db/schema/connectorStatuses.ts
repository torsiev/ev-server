import { int, mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core';
import { connectors } from './connectors';
import { relations } from 'drizzle-orm';

export const connectorStatuses = mysqlTable('connector_statuses', {
  id: int('id', { unsigned: true })
    .primaryKey()
    .references(() => connectors.id),
  status: varchar('status', { length: 255 }),
  statusTimestamp: timestamp('status_timestamp', { mode: 'date', fsp: 6 }),
  errorCode: varchar('error_code', { length: 255 }),
  errorInfo: varchar('error_info', { length: 255 }),
  vendorId: varchar('vendor_id', { length: 255 }),
  vendorErrorCode: varchar('vendor_error_code', { length: 255 }),
});

export const connectorStatusesRelations = relations(
  connectorStatuses,
  ({ one }) => ({
    connector: one(connectors, {
      fields: [connectorStatuses.id],
      references: [connectors.id],
    }),
  }),
);
