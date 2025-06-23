import { defineConfig } from 'drizzle-kit'

import { env } from './src/env.ts'

export default defineConfig({
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  schema: 'src/db/schemas/*',
  out: 'src/db/migrations',
  casing: 'snake_case',
})
