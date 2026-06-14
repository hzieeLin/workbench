import { setActivePinia, createPinia } from 'pinia'
import { useBoardStore } from '@/stores/board'
import { apiClient } from '@/services/api'

jest.mock('@/services/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}))

describe('Board Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.clearAllMocks()
  })

  it('initializes with empty boards', () => {
    const store = useBoardStore()
    expect(store.boards).toEqual([])
    expect(store.currentBoard).toBeNull()
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('sets current board', () => {
    const store = useBoardStore()
    const board = {
      id: 1,
      name: 'Test Board',
      description: 'Test description',
      created_at: new Date(),
      updated_at: new Date(),
      lists: [],
    }
    store.setCurrentBoard(board)
    expect(store.currentBoard).toEqual(board)
  })

  it('clears current board', () => {
    const store = useBoardStore()
    const board = {
      id: 1,
      name: 'Test Board',
      created_at: new Date(),
      updated_at: new Date(),
      lists: [],
    }
    store.setCurrentBoard(board)
    expect(store.currentBoard).toEqual(board)
    store.setCurrentBoard(null)
    expect(store.currentBoard).toBeNull()
  })

  it('fetches boards successfully', async () => {
    const mockBoards = [
      { id: 1, name: 'Board 1', created_at: new Date(), updated_at: new Date(), lists: [] },
      { id: 2, name: 'Board 2', created_at: new Date(), updated_at: new Date(), lists: [] },
    ]
    ;(apiClient.get as jest.Mock).mockResolvedValue(mockBoards)

    const store = useBoardStore()
    await store.fetchBoards()

    expect(apiClient.get).toHaveBeenCalledWith('/boards')
    expect(store.boards).toEqual(mockBoards)
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('handles fetch boards error', async () => {
    ;(apiClient.get as jest.Mock).mockRejectedValue(new Error('API error'))

    const store = useBoardStore()
    await store.fetchBoards()

    expect(store.boards).toEqual([])
    expect(store.error).toBe('API error')
    expect(store.loading).toBe(false)
  })

  it('creates a board successfully', async () => {
    const newBoard = {
      id: 1,
      name: 'New Board',
      description: 'Description',
      created_at: new Date(),
      updated_at: new Date(),
      lists: [],
    }
    ;(apiClient.post as jest.Mock).mockResolvedValue(newBoard)

    const store = useBoardStore()
    const result = await store.createBoard('New Board', 'Description')

    expect(apiClient.post).toHaveBeenCalledWith('/boards', {
      name: 'New Board',
      description: 'Description',
    })
    expect(result).toEqual(newBoard)
    expect(store.boards).toContainEqual(newBoard)
  })

  it('updates a board successfully', async () => {
    const store = useBoardStore()
    store.boards = [{ id: 1, name: 'Old Name', created_at: new Date(), updated_at: new Date() }]

    await store.updateBoard(1, { name: 'New Name' })

    expect(apiClient.patch).toHaveBeenCalledWith('/boards/1', { name: 'New Name' })
    expect(store.boards[0].name).toBe('New Name')
  })

  it('deletes a board successfully', async () => {
    const store = useBoardStore()
    store.boards = [
      { id: 1, name: 'Board to delete', created_at: new Date(), updated_at: new Date() },
    ]

    await store.deleteBoard(1)

    expect(apiClient.delete).toHaveBeenCalledWith('/boards/1')
    expect(store.boards).toEqual([])
  })

  it('clears current board when deleted', async () => {
    const store = useBoardStore()
    store.currentBoard = { id: 1, name: 'Current', created_at: new Date(), updated_at: new Date() }
    store.boards = [store.currentBoard]

    await store.deleteBoard(1)

    expect(store.currentBoard).toBeNull()
  })
})
