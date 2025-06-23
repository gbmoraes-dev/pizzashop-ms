import type { UserCreatedMessage } from '../../../../contracts/messages/user-created-message.ts'

import { channels } from '../channels/index.ts'

export function dispatchUserCreated(data: UserCreatedMessage) {
  channels.auth.publish(
    'auth-events',
    'user.created',
    Buffer.from(JSON.stringify(data)),
    { persistent: true },
  )
}
