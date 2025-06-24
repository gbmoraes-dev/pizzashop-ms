import { eq } from 'drizzle-orm'

import { z } from 'zod/v4'

import { db } from '../../db/client.ts'

import { customers } from '../../db/schemas/customers.ts'

import { channel } from '../channel.ts'

const userCreatedMessageSchema = z.object({
  userId: z.string(),
  name: z.string(),
  email: z.email(),
  role: z.enum(['customer', 'manager']),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const exchange = 'auth-events'

const queue = 'customers.auth-events.queue'

const routingKey = 'user.created'

await channel.assertExchange(exchange, 'direct', { durable: true })

await channel.assertQueue(queue, { durable: true })

await channel.bindQueue(queue, exchange, routingKey)

channel.consume(
  queue,
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

      return channel.ack(message)
    }

    const [customerAlreadyExists] = await db
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.id, userId))
      .limit(1)

    if (customerAlreadyExists) {
      console.warn(
        `[CONSUMER] Client with ID ${userId} already exists. Duplicated message.`,
      )
      return channel.ack(message)
    }

    await db.insert(customers).values({
      id: userId,
      name: name,
      email: email,
      createdAt: new Date(createdAt),
      updatedAt: new Date(updatedAt),
    })

    console.log(`[CONSUMER] Client ${name} inserted with success.`)

    channel.ack(message)
  },
  {
    noAck: false,
  },
)
