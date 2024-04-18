import { relations } from 'drizzle-orm';
import {
  int,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';
import { connectors } from './connectors';
import { transactionStarts } from './transactionStarts';

export const meterValues = mysqlTable('meter_values', {
  id: int('id', { unsigned: true }).autoincrement().primaryKey(),
  connectorPk: int('connector_pk', { unsigned: true })
    .references(() => connectors.id)
    .notNull(),
  transactionId: int('transaction_id', { unsigned: true }).references(
    () => transactionStarts.transactionId,
  ),
  timestamp: timestamp('timestamp', { mode: 'date', fsp: 6 }),
  value: text('value'),
  readingContext: varchar('reading_context', { length: 255 }),
  format: varchar('format', { length: 255 }),
  measurand: varchar('measurand', { length: 255 }),
  location: varchar('location', { length: 255 }),
  unit: varchar('unit', { length: 255 }),
  phase: varchar('phase', { length: 255 }),
});

export const meterValuesRelations = relations(meterValues, ({ one }) => ({
  transactionId: one(transactionStarts, {
    fields: [meterValues.transactionId],
    references: [transactionStarts.transactionId],
  }),
  connector: one(connectors, {
    fields: [meterValues.connectorPk],
    references: [connectors.id],
  }),
}));
