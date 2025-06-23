import { env } from '../env.ts'

import { app } from './app.ts'

app.listen({ host: env.HOSTNAME, port: env.PORT }).then(() => {
  console.log(`🚀 [CUSTOMERS] HTTP server is running on port ${env.PORT}`)
})
