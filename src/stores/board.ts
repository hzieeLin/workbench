import { defineStore } from 'pinia'
import { ref } from 'vue'
import { AppDataSource } from '@/database/connection'
import { Board } from '@/database/entities/Board'

export const useBoardStore = defineStore('board', () => {
  const boards = ref<Board[]>([])
  const currentBoard = ref<Board | null>(null)
  const loading = ref(false)

  async function fetchBoards() {
    loading.value = true
    try {
      const boardRepo = AppDataSource.getRepository(Board)
      boards.value = await boardRepo.find({ order: { created_at: 'DESC' } })
    } finally {
      loading.value = false
    }
  }

  async function createBoard(name: string, description?: string) {
    const boardRepo = AppDataSource.getRepository(Board)
    const board = boardRepo.create({ name, description })
    const saved = await boardRepo.save(board)
    boards.value.unshift(saved)
    return saved
  }

  async function updateBoard(id: number, data: Partial<Board>) {
    const boardRepo = AppDataSource.getRepository(Board)
    await boardRepo.update(id, data)
    const index = boards.value.findIndex((b) => b.id === id)
    if (index !== -1) {
      boards.value[index] = { ...boards.value[index], ...data }
    }
  }

  async function deleteBoard(id: number) {
    const boardRepo = AppDataSource.getRepository(Board)
    await boardRepo.delete(id)
    boards.value = boards.value.filter((b) => b.id !== id)
    if (currentBoard.value?.id === id) {
      currentBoard.value = null
    }
  }

  function setCurrentBoard(board: Board | null) {
    currentBoard.value = board
  }

  return {
    boards,
    currentBoard,
    loading,
    fetchBoards,
    createBoard,
    updateBoard,
    deleteBoard,
    setCurrentBoard,
  }
})
