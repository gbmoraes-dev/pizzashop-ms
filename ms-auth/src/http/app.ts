import '@opentelemetry/auto-instrumentations-node/register'

import { fastifyCors } from '@fastify/cors'

import { fastify } from 'fastify'

import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'

import { ZodError, z } from 'zod/v4'

import { env } from '../env.ts'

import { authRoutes } from './controllers/routes.ts'

export const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

app.register(fastifyCors, { origin: '*' })

app.get('/health', () => {
  return 'OK'
})

app.register(authRoutes)

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: 'Validation error.', issues: z.treeifyError(error) })
  }

  if (env.NODE_ENV !== 'production') {
    console.error(error)
  }

  return reply.status(500).send({ message: 'Internal server error.' })
})
