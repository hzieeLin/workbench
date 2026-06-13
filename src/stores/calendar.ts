import { defineStore } from 'pinia'
import { ref } from 'vue'
import { AppDataSource } from '@/database/connection'
import { CalendarEvent } from '@/database/entities/CalendarEvent'

export const useCalendarStore = defineStore('calendar', () => {
  const events = ref<CalendarEvent[]>([])
  const loading = ref(false)

  async function fetchEvents() {
    loading.value = true
    try {
      const eventRepo = AppDataSource.getRepository(CalendarEvent)
      events.value = await eventRepo.find({ order: { start_time: 'ASC' } })
    } finally {
      loading.value = false
    }
  }

  async function createEvent(data: {
    title: string
    start_time: Date
    end_time: Date
    description?: string
  }) {
    const eventRepo = AppDataSource.getRepository(CalendarEvent)
    const event = eventRepo.create(data)
    const saved = await eventRepo.save(event)
    events.value.push(saved)
    return saved
  }

  async function updateEvent(id: number, data: Partial<CalendarEvent>) {
    const eventRepo = AppDataSource.getRepository(CalendarEvent)
    await eventRepo.update(id, data)
    const index = events.value.findIndex((e) => e.id === id)
    if (index !== -1) {
      events.value[index] = { ...events.value[index], ...data }
    }
  }

  async function deleteEvent(id: number) {
    const eventRepo = AppDataSource.getRepository(CalendarEvent)
    await eventRepo.delete(id)
    events.value = events.value.filter((e) => e.id !== id)
  }

  return {
    events,
    loading,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  }
})
