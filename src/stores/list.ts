import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/database/db'
import type { List } from '@/database/entities/List'

export const useListStore = defineStore('list', () => {
  const lists = ref<List[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchLists(boardId: number) {
    loading.value = true
    try { lists.value = db.lists.find(boardId) } catch (e: any) { error.value = e.message } finally { loading.value = false }
  }

  async function createList(boardId: number, name: string) {
    const maxPos = lists.value.length > 0 ? Math.max(...lists.value.map(l => l.position)) : 0
    const list = db.lists.create({ board_id: boardId, name, position: maxPos + 1 })
    lists.value.push(list)
    return list
  }

  async function updateList(id: number, data: Partial<List>) {
    await db.lists.update(id, data)
    const i = lists.value.findIndex(l => l.id === id)
    if (i !== -1) lists.value[i] = { ...lists.value[i], ...data }
  }

  async function deleteList(id: number) {
    await db.lists.delete(id)
    lists.value = lists.value.filter(l => l.id !== id)
  }

  async function reorderLists(boardId: number, listIds: number[]) {
    for (let i = 0; i < listIds.length; i++) {
      await db.lists.update(listIds[i], { position: i + 1 })
    }
    await fetchLists(boardId)
  }

  return { lists, loading, error, fetchLists, createList, updateList, deleteList, reorderLists }
})
