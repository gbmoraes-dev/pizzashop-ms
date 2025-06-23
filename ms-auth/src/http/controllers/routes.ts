import type { FastifyInstance } from 'fastify'

import { register } from './register.ts'

export async function authRoutes(app: FastifyInstance) {
  app.post('/sign-up', register)
}
