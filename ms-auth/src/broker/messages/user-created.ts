import type { UserCreatedMessage } from '../../../../contracts/messages/user-created-message.ts'

import { channel } from '../channel.ts'

const exchange = 'auth-events'

const routingKey = 'user.created'

await channel.assertExchange(exchange, 'direct', { durable: true })

export function dispatchUserCreated(data: UserCreatedMessage) {
  channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(data)), {
    persistent: true,
  })
}
