import { defineStore } from 'pinia'
import { ref } from 'vue'
import { AppDataSource } from '@/database/connection'
import { List } from '@/database/entities/List'

export const useListStore = defineStore('list', () => {
  const lists = ref<List[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchLists(boardId: number) {
    loading.value = true
    error.value = null
    try {
      const listRepo = AppDataSource.getRepository(List)
      lists.value = await listRepo.find({
        where: { board_id: boardId },
        order: { position: 'ASC' },
      })
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  async function createList(boardId: number, name: string) {
    error.value = null
    try {
      const listRepo = AppDataSource.getRepository(List)
      const maxPosition =
        lists.value.length > 0 ? Math.max(...lists.value.map((l) => l.position)) : 0
      const list = listRepo.create({ board_id: boardId, name, position: maxPosition + 1 })
      const saved = await listRepo.save(list)
      lists.value.push(saved)
      return saved
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  async function updateList(id: number, data: Partial<List>) {
    error.value = null
    try {
      const listRepo = AppDataSource.getRepository(List)
      await listRepo.update(id, data)
      const index = lists.value.findIndex((l) => l.id === id)
      if (index !== -1) {
        lists.value[index] = { ...lists.value[index], ...data }
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  async function deleteList(id: number) {
    error.value = null
    try {
      const listRepo = AppDataSource.getRepository(List)
      await listRepo.delete(id)
      lists.value = lists.value.filter((l) => l.id !== id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  async function reorderLists(boardId: number, listIds: number[]) {
    error.value = null
    try {
      const listRepo = AppDataSource.getRepository(List)
      await Promise.all(listIds.map((id, i) => listRepo.update(id, { position: i + 1 })))
      await fetchLists(boardId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  return {
    lists,
    loading,
    error,
    fetchLists,
    createList,
    updateList,
    deleteList,
    reorderLists,
  }
})
