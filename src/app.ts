import 'reflect-metadata'
import { PrismaClient } from '@prisma/client'
import { StartServer } from './api/index.js'
import { EventBus } from './events/events.js'
import { RegisterIntegrations, StartPolling } from './integrations/index.js'

const prisma = new PrismaClient()
const pollInterval = 1000 * 5 // seconds

await RegisterIntegrations(prisma, EventBus)
await StartPolling(prisma, EventBus, pollInterval)
await StartServer(prisma, EventBus)
