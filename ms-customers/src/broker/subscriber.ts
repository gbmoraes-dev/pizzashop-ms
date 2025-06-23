import { eq } from 'drizzle-orm'

import { z } from 'zod/v4'

import { db } from '../db/client.ts'

import { customers } from '../db/schemas/customers.ts'

import { auth } from './channels/auth.ts'

const userCreatedMessageSchema = z.object({
  userId: z.string(),
  name: z.string(),
  email: z.email(),
  role: z.enum(['customer', 'manager']),
  createdAt: z.string(),
  updatedAt: z.string(),
})

auth.consume(
  'customers.auth-events.queue',
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

      return auth.ack(message)
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
      return auth.ack(message)
    }

    await db.insert(customers).values({
      id: userId,
      name: name,
      email: email,
      createdAt: new Date(createdAt),
      updatedAt: new Date(updatedAt),
    })

    console.log(`[CONSUMER] Client ${name} inserted with success.`)

    auth.ack(message)
  },
  {
    noAck: false,
  },
)
