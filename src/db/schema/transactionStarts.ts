import { relations, sql } from 'drizzle-orm';
import { int, mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core';
import { connectors } from './connectors';
import { ocppTags } from './ocppTags';
import { transactionStops } from './transactionStops';
import { meterValues } from './meterValues';

export const transactionStarts = mysqlTable('transaction_starts', {
  transactionId: int('transaction_id', { unsigned: true })
    .autoincrement()
    .primaryKey(),
  connectorPk: int('connector_pk', { unsigned: true })
    .references(() => connectors.id)
    .notNull(),
  idTag: varchar('id_tag', { length: 255 })
    .references(() => ocppTags.idTag)
    .notNull(),
  startTimestamp: timestamp('start_timestamp', { mode: 'date', fsp: 6 })
    .default(sql`CURRENT_TIMESTAMP(6)`)
    .notNull(),
  meterStart: int('meter_start', { unsigned: true }).notNull(),
});

export const transactionStartsRelations = relations(
  transactionStarts,
  ({ one, many }) => ({
    connector: one(connectors, {
      fields: [transactionStarts.connectorPk],
      references: [connectors.id],
    }),
    ocppTag: one(ocppTags, {
      fields: [transactionStarts.idTag],
      references: [ocppTags.idTag],
    }),
    transactionStop: one(transactionStops),
    meterValues: many(meterValues),
  }),
);
