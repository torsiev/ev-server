import { relations } from 'drizzle-orm';
import {
  AnyMySqlColumn,
  int,
  mysqlTable,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';
import { users } from './users';
import { transactionStarts } from './transactionStarts';

export const ocppTags = mysqlTable('ocpp_tags', {
  id: int('id', { unsigned: true }).autoincrement().primaryKey(),
  idTag: varchar('id_tag', { length: 255 }).unique().notNull(),
  parentIdTag: varchar('parent_id_tag', { length: 255 }).references(
    (): AnyMySqlColumn => ocppTags.idTag,
  ),
  expiredDate: timestamp('expired_date'),
});

export const ocppTagsRelation = relations(ocppTags, ({ one, many }) => ({
  parent: one(ocppTags, {
    fields: [ocppTags.parentIdTag],
    references: [ocppTags.idTag],
  }),
  user: one(users),
  transactionStarts: many(transactionStarts),
}));
