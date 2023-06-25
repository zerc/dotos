import * as _ from 'lodash-es'
import { v4 as uuidv4 } from 'uuid'
import { PrismaClient } from '@prisma/client'
import { EventBusInterface, TodoEventInterface } from '../../events/events.js'
import { AbstractClient } from './base.js'
import { DUMMY_INTEGRATION_ENABLED } from '../config.js'

class DummyItem {
  id: string
  content: string
  completed: boolean
}

class DummyIntegration extends AbstractClient {
  readonly name: string = 'dummy'

  private dummyIncoming: DummyItem[]
  private dummyStorage: { id?: string; item?: DummyItem }

  constructor() {
    super()

    this.dummyIncoming = []
    this.dummyStorage = {}

    _.forEach(_.range(1), (value) => {
      this.dummyIncoming.push({
        id: uuidv4(),
        content: `dum-dum dummy todo number ${value}`,
        completed: value % 2 === 0
      })
    })
  }

  async pull(prisma: PrismaClient, eventBus: EventBusInterface): Promise<number> {
    let count = 0

    if (this.dummyIncoming.length > 0) {
      const item = this.dummyIncoming.pop()
      eventBus.todoCreated({
        id: uuidv4(),
        source: this.name,
        timestamp: new Date(),
        payload: {
          id: item.id,
          text: item.content,
          completed: item.completed
        }
      })
      this.dummyStorage[item.id] = item
      count += 1
    }

    this.logInfo(`pulled ${count} items`)
    this.logInfo(`items in storage: ${_.size(this.dummyStorage)}`)

    return count
  }

  async push(prisma: PrismaClient, eventBus: EventBusInterface, event: TodoEventInterface): Promise<boolean> {
    if (_.has(this.dummyStorage, event.payload.id)) {
      this.logInfo(`updated item with id = ${event.payload.id}`)
    } else {
      this.logInfo(`added a new item with id = ${event.payload.id}`)
    }

    this.dummyStorage[event.payload.id] = {
      id: event.payload.id,
      content: event.payload.text,
      completed: event.payload.completed
    }

    return true
  }

  enabled(): boolean {
    return DUMMY_INTEGRATION_ENABLED
  }
}

export const dummyInt = new DummyIntegration()
