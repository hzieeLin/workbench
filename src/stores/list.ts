import { defineStore } from 'pinia'
import { ref } from 'vue'
import { AppDataSource } from '@/database/connection'
import { List } from '@/database/entities/List'

export const useListStore = defineStore('list', () => {
  const lists = ref<List[]>([])
  const loading = ref(false)

  async function fetchLists(boardId: number) {
    loading.value = true
    try {
      const listRepo = AppDataSource.getRepository(List)
      lists.value = await listRepo.find({
        where: { board_id: boardId },
        order: { position: 'ASC' },
      })
    } finally {
      loading.value = false
    }
  }

  async function createList(boardId: number, name: string) {
    const listRepo = AppDataSource.getRepository(List)
    const maxPosition = lists.value.length > 0 ? Math.max(...lists.value.map((l) => l.position)) : 0
    const list = listRepo.create({ board_id: boardId, name, position: maxPosition + 1 })
    const saved = await listRepo.save(list)
    lists.value.push(saved)
    return saved
  }

  async function updateList(id: number, data: Partial<List>) {
    const listRepo = AppDataSource.getRepository(List)
    await listRepo.update(id, data)
    const index = lists.value.findIndex((l) => l.id === id)
    if (index !== -1) {
      lists.value[index] = { ...lists.value[index], ...data }
    }
  }

  async function deleteList(id: number) {
    const listRepo = AppDataSource.getRepository(List)
    await listRepo.delete(id)
    lists.value = lists.value.filter((l) => l.id !== id)
  }

  async function reorderLists(boardId: number, listIds: number[]) {
    const listRepo = AppDataSource.getRepository(List)
    for (let i = 0; i < listIds.length; i++) {
      await listRepo.update(listIds[i], { position: i + 1 })
    }
    await fetchLists(boardId)
  }

  return {
    lists,
    loading,
    fetchLists,
    createList,
    updateList,
    deleteList,
    reorderLists,
  }
})
