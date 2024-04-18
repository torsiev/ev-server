import { int, mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import { addresses } from './addresses';
import { ocppTags } from './ocppTags';
import { relations } from 'drizzle-orm';

export const users = mysqlTable('users', {
  id: int('id', { unsigned: true }).autoincrement().primaryKey(),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  email: varchar('email', { length: 255 }).unique(),
  password: varchar('password', { length: 255 }),
  phone: varchar('phone', { length: 15 }),
  ocppTagId: int('ocpp_tag_id', { unsigned: true }).references(
    () => ocppTags.id,
  ),
  addressId: int('address_id', { unsigned: true }).references(
    () => addresses.id,
  ),
});

export const usersRelations = relations(users, ({ one }) => ({
  ocppTag: one(ocppTags, {
    fields: [users.ocppTagId],
    references: [ocppTags.id],
  }),
  address: one(addresses, {
    fields: [users.addressId],
    references: [addresses.id],
  }),
}));
