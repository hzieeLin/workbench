import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Label } from '@/database/entities/Label'
import { apiClient } from '@/services/api'

export const useLabelStore = defineStore('label', () => {
  const labels = ref<Label[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchLabels(boardId: number) {
    loading.value = true
    error.value = null
    try {
      labels.value = await apiClient.get<Label[]>(`/boards/${boardId}/labels`)
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  async function createLabel(boardId: number, name: string, color: string) {
    error.value = null
    try {
      const label = await apiClient.post<Label>(`/boards/${boardId}/labels`, { name, color })
      labels.value.push(label)
      return label
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  async function updateLabel(id: number, data: Partial<Label>) {
    error.value = null
    try {
      await apiClient.patch(`/labels/${id}`, data as Record<string, unknown>)
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
      await apiClient.delete(`/labels/${id}`)
      labels.value = labels.value.filter((l) => l.id !== id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  return { labels, loading, error, fetchLabels, createLabel, updateLabel, deleteLabel }
})
