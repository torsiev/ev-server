import { int, mysqlTable } from 'drizzle-orm/mysql-core';
import { chargeboxes } from './chargeboxes';
import { relations } from 'drizzle-orm';
import { connectorStatuses } from './connectorStatuses';
import { transactionStarts } from './transactionStarts';
import { meterValues } from './meterValues';

export const connectors = mysqlTable('connectors', {
  id: int('id', { unsigned: true }).autoincrement().primaryKey(),
  chargeboxId: int('chargebox_id', { unsigned: true })
    .references(() => chargeboxes.id)
    .notNull(),
  connectorId: int('connector_id', { unsigned: true }).notNull(),
});

export const connectorsRelations = relations(connectors, ({ one, many }) => ({
  chargebox: one(chargeboxes, {
    fields: [connectors.chargeboxId],
    references: [chargeboxes.id],
  }),
  connectorStatus: one(connectorStatuses),
  transactionStarts: many(transactionStarts),
  meterValues: many(meterValues),
}));
