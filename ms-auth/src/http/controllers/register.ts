import { hash } from 'bcryptjs'

import { eq } from 'drizzle-orm'

import type { FastifyReply, FastifyRequest } from 'fastify'

import { z } from 'zod/v4'

import { dispatchUserCreated } from '../../broker/messages/user-created.ts'

import { db } from '../../db/client.ts'

import { users } from '../../db/schemas/user.ts'

export async function register(request: FastifyRequest, reply: FastifyReply) {
  const registerBodySchema = z.object({
    name: z.string().min(3),
    email: z.email(),
    password: z.string().min(8),
    role: z.enum(['customer', 'manager']).default('customer'),
  })

  const { name, email, password, role } = registerBodySchema.parse(request.body)

  const [emailAlreadyInUse] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (emailAlreadyInUse) {
    return reply.status(409).send({
      message: 'This email is already in use',
    })
  }

  const hashed = await hash(password, 6)

  const [user] = await db
    .insert(users)
    .values({
      name,
      email,
      password: hashed,
      role,
    })
    .returning()

  dispatchUserCreated({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  })

  console.log('[PRODUCER] User created and event dispatched')

  return reply.status(201).send({
    ...user,
    password: undefined,
  })
}
