import { sql } from 'drizzle-orm';
import {
  foreignKey,
  int,
  mysqlEnum,
  mysqlTable,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';
import { transactionStarts } from './transactionStarts';
import { OCPP_EVENT_ACTOR } from 'types/ocpp/ocppCommon';
import { relations } from 'drizzle-orm';

export const transactionStops = mysqlTable(
  'transaction_stops',
  {
    transactionId: int('transaction_id', { unsigned: true }).primaryKey(),
    eventActor: mysqlEnum('event_actor', [
      OCPP_EVENT_ACTOR.MANUAL,
      OCPP_EVENT_ACTOR.STATION,
    ]),
    stopTimestamp: timestamp('stop_timestamp', { mode: 'date', fsp: 6 })
      .default(sql`CURRENT_TIMESTAMP(6)`)
      .notNull(),
    meterStop: int('meter_stop', { unsigned: true }).notNull(),
    stopReason: varchar('stop_reason', { length: 255 }),
  },
  (table) => ({
    transactionFk: foreignKey({
      columns: [table.transactionId],
      foreignColumns: [transactionStarts.transactionId],
      name: 'transaction_stops_transaction_id_fk',
    }),
  }),
);

export const transactionStopsRelations = relations(
  transactionStops,
  ({ one }) => ({
    transactionStart: one(transactionStarts, {
      fields: [transactionStops.transactionId],
      references: [transactionStarts.transactionId],
    }),
  }),
);
