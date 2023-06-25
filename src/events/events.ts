import { slot, createEventBus, Slot, EventDeclaration } from 'ts-event-bus'

export interface TodoEventInterface {
  id: string
  source: string
  timestamp: Date
  payload: {
    id: string
    text: string
    completed: boolean
  }
}

export interface EventBusInterface extends EventDeclaration {
  todoCreated: Slot<TodoEventInterface, void>
  todoUpdated: Slot<TodoEventInterface, void>
}

const Events: EventBusInterface = {
  todoCreated: slot<TodoEventInterface, void>(),
  todoUpdated: slot<TodoEventInterface, void>()
}

export const EventBus = createEventBus({
  events: Events
})
