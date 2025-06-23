import { eq } from 'drizzle-orm'

import { z } from 'zod/v4'

import { db } from '../db/client.ts'

import { customers } from '../db/schemas/customers.ts'

import { users } from './channels/users.ts'

const userCreatedMessageSchema = z.object({
  userId: z.string(),
  name: z.string(),
  email: z.email(),
  role: z.enum(['customer', 'manager']),
  createdAt: z.string(),
  updatedAt: z.string(),
})

users.consume(
  'user.created',
  async (message) => {
    if (!message) {
      return null
    }

    const content = JSON.parse(message.content.toString())

    const parsedMessage = userCreatedMessageSchema.parse(content)

    const { userId, name, email, role, createdAt, updatedAt } = parsedMessage

    if (role !== 'customer') {
      console.warn(
        `[CONSUMER] Received user with role ${role}, skipping customer creation.`,
      )

      return users.ack(message)
    }

    const [customerAlreadyExists] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, userId))
      .limit(1)

    if (customerAlreadyExists) {
      console.warn(
        `[CONSUMER] Client with ID ${userId} already exists. Duplicated message.`,
      )
      return users.ack(message)
    }

    await db.insert(customers).values({
      id: userId,
      name: name,
      email: email,
      createdAt: new Date(createdAt),
      updatedAt: new Date(updatedAt),
    })

    console.log(`[CONSUMER] Client ${name} inserted with success.`)

    users.ack(message)
  },
  {
    noAck: false,
  },
)
