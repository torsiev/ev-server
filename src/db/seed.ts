import { eq } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
import { addresses, chargeboxes, connectors, ocppTags, users } from './schema';
import { WssProtocol } from 'types/server';

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
    street: 'Jl Telekomunikasi 1, Gedung Selaru',
    zipCode: '40257',
    city: 'Kabupaten Bandung',
    country: 'Indonesia',
  });

  // Insert addresses chargeboxes
  const chargeBoxesAddress = await db.insert(addresses).values({
    street: 'Jl Telekomunikasi 1, Gedung Telkom University Landmark Tower',
    zipCode: '40257',
    city: 'Kabupaten Bandung',
    country: 'Indonesia',
  });

  // Insert data to chargeboxes
  const chargeBoxesTable = await db.insert(chargeboxes).values({
    addressId: chargeBoxesAddress[0].insertId,
    identifier: '123',
    ocppProtocol: WssProtocol.OCPP16,
    locationLatitude: '38.8958',
    locationLongitude: '-132.4095',
  });

  // Insert data to connectorsTable
  await db.insert(connectors).values({
    chargeboxId: chargeBoxesTable[0].insertId,
    connectorId: chargeBoxesTable[0].insertId,
  });

  //Update user data with ocpp tag id and address id
  await db
    .update(users)
    .set({
      ocppTagId: ocppTagsTable[0].insertId,
      addressId: addressesTable[0].insertId,
    })
    .where(eq(users.id, usersTable[0].insertId));
}
