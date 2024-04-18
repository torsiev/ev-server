import { relations } from 'drizzle-orm';
import { int, mysqlTable, varchar } from 'drizzle-orm/mysql-core';
import { users } from './users';

export const addresses = mysqlTable('addresses', {
  id: int('id', { unsigned: true }).autoincrement().primaryKey(),
  street: varchar('street', { length: 1000 }),
  zipCode: varchar('zip_code', { length: 10 }),
  city: varchar('city', { length: 255 }),
  country: varchar('country', { length: 255 }),
});

export const addressesRelations = relations(addresses, ({ one }) => ({
  userAddress: one(users),
  chargeboxAddress: one(users),
}));
