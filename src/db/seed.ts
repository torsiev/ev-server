import { eq } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { addresses, ocppTags, users } from './schema';

export default async function seed(db: MySql2Database) {
  // Insert admin data to users table
  const usersTable = await db.insert(users).values({
    firstName: 'Torsi',
    lastName: 'Ev',
    email: 'admin@mail.com',
    password: '123456',
    phone: '1234567890',
  });

  // Insert admin ocpp tag
  const ocppTagsTable = await db.insert(ocppTags).values({
    idTag: '123456',
  });

  // Insert admin adddress
  const addressesTable = await db.insert(addresses).values({
    street: 'Jl Telekomunikasi 1',
    zipCode: '40257',
    city: 'Kabupaten Bandung',
    country: 'Indonesia',
  });

  // Update user data with ocpp tag id and address id
  await db
    .update(users)
    .set({
      ocppTagId: ocppTagsTable[0].insertId,
      addressId: addressesTable[0].insertId,
    })
    .where(eq(users.id, usersTable[0].insertId));
}
