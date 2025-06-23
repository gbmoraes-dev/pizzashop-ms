import { createId } from '@paralleldrive/cuid2'

import { pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const userRoles = pgEnum('user_roles', ['customer', 'manager'])

export const users = pgTable('users', {
  id: text()
    .$defaultFn(() => createId())
    .primaryKey(),
  name: text().notNull(),
  email: text().notNull().unique(),
  password: text().notNull(),
  role: userRoles().default('customer').notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp()
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})
