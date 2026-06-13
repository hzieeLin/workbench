import { defineStore } from 'pinia'
import { ref } from 'vue'
import { AppDataSource } from '@/database/connection'
import { TimeBlock } from '@/database/entities/TimeBlock'

export const useTimeBlockStore = defineStore('timeBlock', () => {
  const timeBlocks = ref<TimeBlock[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchTimeBlocks() {
    loading.value = true
    error.value = null
    try {
      const timeBlockRepo = AppDataSource.getRepository(TimeBlock)
      timeBlocks.value = await timeBlockRepo.find({ order: { start_time: 'ASC' } })
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  async function fetchTimeBlocksByCard(cardId: number) {
    loading.value = true
    error.value = null
    try {
      const timeBlockRepo = AppDataSource.getRepository(TimeBlock)
      timeBlocks.value = await timeBlockRepo.find({
        where: { card_id: cardId },
        order: { start_time: 'ASC' },
      })
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  async function createTimeBlock(data: {
    card_id?: number
    start_time: Date
    end_time: Date
    title: string
  }) {
    error.value = null
    try {
      const timeBlockRepo = AppDataSource.getRepository(TimeBlock)
      const timeBlock = timeBlockRepo.create(data)
      const saved = await timeBlockRepo.save(timeBlock)
      timeBlocks.value.push(saved)
      return saved
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  async function updateTimeBlock(id: number, data: Partial<TimeBlock>) {
    error.value = null
    try {
      const timeBlockRepo = AppDataSource.getRepository(TimeBlock)
      await timeBlockRepo.update(id, data)
      const index = timeBlocks.value.findIndex((t) => t.id === id)
      if (index !== -1) {
        timeBlocks.value[index] = { ...timeBlocks.value[index], ...data }
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  async function deleteTimeBlock(id: number) {
    error.value = null
    try {
      const timeBlockRepo = AppDataSource.getRepository(TimeBlock)
      await timeBlockRepo.delete(id)
      timeBlocks.value = timeBlocks.value.filter((t) => t.id !== id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  return {
    timeBlocks,
    loading,
    error,
    fetchTimeBlocks,
    fetchTimeBlocksByCard,
    createTimeBlock,
    updateTimeBlock,
    deleteTimeBlock,
  }
})
