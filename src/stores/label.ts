import { defineStore } from 'pinia'
import { ref } from 'vue'
import { AppDataSource } from '@/database/connection'
import { Label } from '@/database/entities/Label'

export const useLabelStore = defineStore('label', () => {
  const labels = ref<Label[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchLabels() {
    loading.value = true
    error.value = null
    try {
      const labelRepo = AppDataSource.getRepository(Label)
      labels.value = await labelRepo.find()
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  async function createLabel(name: string, color: string) {
    error.value = null
    try {
      const labelRepo = AppDataSource.getRepository(Label)
      const label = labelRepo.create({ name, color })
      const saved = await labelRepo.save(label)
      labels.value.push(saved)
      return saved
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  async function updateLabel(id: number, data: Partial<Label>) {
    error.value = null
    try {
      const labelRepo = AppDataSource.getRepository(Label)
      await labelRepo.update(id, data)
      const index = labels.value.findIndex((l) => l.id === id)
      if (index !== -1) {
        labels.value[index] = { ...labels.value[index], ...data }
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  async function deleteLabel(id: number) {
    error.value = null
    try {
      const labelRepo = AppDataSource.getRepository(Label)
      await labelRepo.delete(id)
      labels.value = labels.value.filter((l) => l.id !== id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  return {
    labels,
    loading,
    error,
    fetchLabels,
    createLabel,
    updateLabel,
    deleteLabel,
  }
})
