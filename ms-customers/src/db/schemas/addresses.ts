import { createId } from '@paralleldrive/cuid2'
import { relations } from 'drizzle-orm'

import { boolean, pgEnum, pgTable, text } from 'drizzle-orm/pg-core'

import { customers } from './customers.ts'

export const addressType = pgEnum('address_type', ['home', 'work', 'other'])

export const addresses = pgTable('addresses', {
  id: text()
    .$defaultFn(() => createId())
    .primaryKey(),
  customerId: text()
    .references(() => customers.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  type: addressType().default('home').notNull(),
  street: text().notNull(),
  number: text().notNull(),
  complement: text(),
  zipCode: text().notNull(),
  city: text().notNull(),
  state: text().notNull(),
  isDefault: boolean().default(false).notNull(),
})

export const addressesRelations = relations(addresses, ({ one }) => ({
  customer: one(customers, {
    fields: [addresses.customerId],
    references: [customers.id],
  }),
}))
