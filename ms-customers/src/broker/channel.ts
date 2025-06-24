import { broker } from './broker.ts'

export const channel = await broker.createChannel()
