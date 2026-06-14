import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Board } from '@/database/entities/Board'
import { apiClient } from '@/services/api'

export const useBoardStore = defineStore('board', () => {
  const boards = ref<Board[]>([])
  const currentBoard = ref<Board | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchBoards() {
    loading.value = true
    error.value = null
    try {
      boards.value = await apiClient.get<Board[]>('/boards')
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  async function createBoard(name: string, description?: string) {
    const board = await apiClient.post<Board>('/boards', { name, description })
    boards.value.unshift(board)
    return board
  }

  async function updateBoard(id: number, data: Partial<Board>) {
    await apiClient.patch(`/boards/${id}`, data as Record<string, unknown>)
    const i = boards.value.findIndex(b => b.id === id)
    if (i !== -1) boards.value[i] = { ...boards.value[i], ...data }
  }

  async function deleteBoard(id: number) {
    await apiClient.delete(`/boards/${id}`)
    boards.value = boards.value.filter(b => b.id !== id)
    if (currentBoard.value?.id === id) currentBoard.value = null
  }

  function setCurrentBoard(board: Board | null) { currentBoard.value = board }

  return { boards, currentBoard, loading, error, fetchBoards, createBoard, updateBoard, deleteBoard, setCurrentBoard }
})
