import { broker } from '../broker.ts'

export const auth = await broker.createChannel()

await auth.assertExchange('auth-events', 'direct', { durable: true })
