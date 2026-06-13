import { defineStore } from 'pinia'
import { ref } from 'vue'
import { AppDataSource } from '@/database/connection'
import { Label } from '@/database/entities/Label'

export const useLabelStore = defineStore('label', () => {
  const labels = ref<Label[]>([])
  const loading = ref(false)

  async function fetchLabels() {
    loading.value = true
    try {
      const labelRepo = AppDataSource.getRepository(Label)
      labels.value = await labelRepo.find()
    } finally {
      loading.value = false
    }
  }

  async function createLabel(name: string, color: string) {
    const labelRepo = AppDataSource.getRepository(Label)
    const label = labelRepo.create({ name, color })
    const saved = await labelRepo.save(label)
    labels.value.push(saved)
    return saved
  }

  async function updateLabel(id: number, data: Partial<Label>) {
    const labelRepo = AppDataSource.getRepository(Label)
    await labelRepo.update(id, data)
    const index = labels.value.findIndex((l) => l.id === id)
    if (index !== -1) {
      labels.value[index] = { ...labels.value[index], ...data }
    }
  }

  async function deleteLabel(id: number) {
    const labelRepo = AppDataSource.getRepository(Label)
    await labelRepo.delete(id)
    labels.value = labels.value.filter((l) => l.id !== id)
  }

  return {
    labels,
    loading,
    fetchLabels,
    createLabel,
    updateLabel,
    deleteLabel,
  }
})
