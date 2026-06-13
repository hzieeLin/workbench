import { defineStore } from 'pinia'
import { ref } from 'vue'
import { db } from '@/database/db'
import type { Board } from '@/database/entities/Board'

export const useBoardStore = defineStore('board', () => {
  const boards = ref<Board[]>([])
  const currentBoard = ref<Board | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchBoards() {
    loading.value = true
    try { boards.value = db.boards.find() } catch (e: any) { error.value = e.message } finally { loading.value = false }
  }

  async function createBoard(name: string, description?: string) {
    const board = db.boards.create({ name, description })
    boards.value.unshift(board)
    return board
  }

  async function updateBoard(id: number, data: Partial<Board>) {
    await db.boards.update(id, data)
    const i = boards.value.findIndex(b => b.id === id)
    if (i !== -1) boards.value[i] = { ...boards.value[i], ...data }
  }

  async function deleteBoard(id: number) {
    await db.boards.delete(id)
    boards.value = boards.value.filter(b => b.id !== id)
    if (currentBoard.value?.id === id) currentBoard.value = null
  }

  function setCurrentBoard(board: Board | null) { currentBoard.value = board }

  return { boards, currentBoard, loading, error, fetchBoards, createBoard, updateBoard, deleteBoard, setCurrentBoard }
})
