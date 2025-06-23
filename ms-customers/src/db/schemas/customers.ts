import { relations } from 'drizzle-orm'

import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

import { addresses } from './addresses.ts'

export const customers = pgTable('customers', {
  id: text().primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  phone: text(),
  createdAt: timestamp().notNull(),
  updatedAt: timestamp()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const customersRelations = relations(customers, ({ many }) => ({
  addresses: many(addresses),
}))
