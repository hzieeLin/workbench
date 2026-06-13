import { defineStore } from 'pinia'
import { ref } from 'vue'
import { AppDataSource } from '@/database/connection'
import { Board } from '@/database/entities/Board'

export const useBoardStore = defineStore('board', () => {
  const boards = ref<Board[]>([])
  const currentBoard = ref<Board | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchBoards() {
    loading.value = true
    error.value = null
    try {
      const boardRepo = AppDataSource.getRepository(Board)
      boards.value = await boardRepo.find({ order: { created_at: 'DESC' } })
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  async function createBoard(name: string, description?: string) {
    error.value = null
    try {
      const boardRepo = AppDataSource.getRepository(Board)
      const board = boardRepo.create({ name, description })
      const saved = await boardRepo.save(board)
      boards.value.unshift(saved)
      return saved
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  async function updateBoard(id: number, data: Partial<Board>) {
    error.value = null
    try {
      const boardRepo = AppDataSource.getRepository(Board)
      await boardRepo.update(id, data)
      const index = boards.value.findIndex((b) => b.id === id)
      if (index !== -1) {
        boards.value[index] = { ...boards.value[index], ...data }
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  async function deleteBoard(id: number) {
    error.value = null
    try {
      const boardRepo = AppDataSource.getRepository(Board)
      await boardRepo.delete(id)
      boards.value = boards.value.filter((b) => b.id !== id)
      if (currentBoard.value?.id === id) {
        currentBoard.value = null
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  function setCurrentBoard(board: Board | null) {
    currentBoard.value = board
  }

  return {
    boards,
    currentBoard,
    loading,
    error,
    fetchBoards,
    createBoard,
    updateBoard,
    deleteBoard,
    setCurrentBoard,
  }
})
