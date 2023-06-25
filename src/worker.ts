import 'reflect-metadata'
import { PrismaClient } from '@prisma/client'
import { EventBus } from './events/events.js'
import { RegisterIntegrations, StartPolling } from './integrations/index.js'
import { RegisterAppReceivers } from './api/index.js'

const prisma = new PrismaClient()
const pollInterval = 1000 * 5 // seconds

RegisterAppReceivers(prisma, EventBus)
await RegisterIntegrations(prisma, EventBus)
await StartPolling(prisma, EventBus, pollInterval)
