import { setActivePinia, createPinia } from 'pinia'
import { useBoardStore } from '@/stores/board'
import { AppDataSource } from '@/database/connection'

jest.mock('@/database/connection', () => ({
  AppDataSource: {
    getRepository: jest.fn().mockReturnValue({
      find: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockImplementation((data) => ({
        id: 1,
        name: data.name,
        description: data.description,
        created_at: new Date(),
        updated_at: new Date(),
      })),
      save: jest.fn().mockImplementation((entity) =>
        Promise.resolve({
          ...entity,
          id: 1,
          created_at: new Date(),
          updated_at: new Date(),
        })
      ),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    }),
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
      { id: 1, name: 'Board 1', created_at: new Date(), updated_at: new Date() },
      { id: 2, name: 'Board 2', created_at: new Date(), updated_at: new Date() },
    ]
    const mockRepo = AppDataSource.getRepository as jest.Mock
    mockRepo().find.mockResolvedValue(mockBoards)

    const store = useBoardStore()
    await store.fetchBoards()

    expect(store.boards).toEqual(mockBoards)
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('handles fetch boards error', async () => {
    const mockRepo = AppDataSource.getRepository as jest.Mock
    mockRepo().find.mockRejectedValue(new Error('Database error'))

    const store = useBoardStore()
    await store.fetchBoards()

    expect(store.boards).toEqual([])
    expect(store.error).toBe('Database error')
    expect(store.loading).toBe(false)
  })

  it('creates a board successfully', async () => {
    const store = useBoardStore()
    const newBoard = await store.createBoard('New Board', 'Description')

    expect(newBoard).toBeDefined()
    expect(newBoard.name).toBe('New Board')
    expect(store.boards).toContainEqual(newBoard)
  })

  it('updates a board successfully', async () => {
    const store = useBoardStore()
    store.boards = [{ id: 1, name: 'Old Name', created_at: new Date(), updated_at: new Date() }]

    await store.updateBoard(1, { name: 'New Name' })

    expect(store.boards[0].name).toBe('New Name')
  })

  it('deletes a board successfully', async () => {
    const store = useBoardStore()
    store.boards = [
      { id: 1, name: 'Board to delete', created_at: new Date(), updated_at: new Date() },
    ]

    await store.deleteBoard(1)

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
