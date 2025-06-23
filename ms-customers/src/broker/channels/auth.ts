import { broker } from '../broker.ts'

const exchange = 'auth-events'

const queue = 'customers.auth-events.queue'

const routingKey = 'user.created'

export const auth = await broker.createChannel()

await auth.assertExchange(exchange, 'direct', { durable: true })

await auth.assertQueue(queue, { durable: true })

await auth.bindQueue(queue, exchange, routingKey)
