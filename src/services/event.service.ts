export interface EventParticipant {
  _id?: string
  id?: string
  name?: string
}

export interface Event {
  _id?: string
  id?: string
  name: string
  status: string
  type: string
  description?: string
  participants?: EventParticipant[]
  maxParticipants?: number
  startDate?: string
}

export class EventService {}

export const eventService = new EventService()
