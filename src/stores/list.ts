import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { List } from '@/database/entities/List'
import { apiClient } from '@/services/api'

export const useListStore = defineStore('list', () => {
  const lists = ref<List[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchLists(boardId: number) {
    loading.value = true
    error.value = null
    try {
      lists.value = await apiClient.get<List[]>(`/boards/${boardId}/lists`)
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  async function createList(boardId: number, name: string) {
    const list = await apiClient.post<List>(`/boards/${boardId}/lists`, { name })
    lists.value.push(list)
    return list
  }

  async function updateList(id: number, data: Partial<List>) {
    await apiClient.patch(`/lists/${id}`, data as Record<string, unknown>)
    const i = lists.value.findIndex((l) => l.id === id)
    if (i !== -1) lists.value[i] = { ...lists.value[i], ...data }
  }

  async function deleteList(id: number) {
    await apiClient.delete(`/lists/${id}`)
    lists.value = lists.value.filter((l) => l.id !== id)
  }

  async function reorderLists(boardId: number, listIds: number[]) {
    for (let i = 0; i < listIds.length; i++) {
      await apiClient.patch(`/lists/${listIds[i]}`, { position: i + 1 })
    }
    await fetchLists(boardId)
  }

  return { lists, loading, error, fetchLists, createList, updateList, deleteList, reorderLists }
})
