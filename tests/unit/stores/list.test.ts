import { setActivePinia, createPinia } from 'pinia'
import { useListStore } from '@/stores/list'
import { apiClient } from '@/services/api'

jest.mock('@/services/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}))

describe('List Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.clearAllMocks()
  })

  it('fetches lists for a board', async () => {
    const lists = [
      { id: 1, board_id: 1, name: 'Todo', position: 1, created_at: new Date(), cards: [] },
    ]
    ;(apiClient.get as jest.Mock).mockResolvedValue(lists)

    const store = useListStore()
    await store.fetchLists(1)

    expect(apiClient.get).toHaveBeenCalledWith('/boards/1/lists')
    expect(store.lists).toEqual(lists)
    expect(store.loading).toBe(false)
  })

  it('creates a list through the API', async () => {
    const list = { id: 2, board_id: 1, name: 'Doing', position: 2, created_at: new Date(), cards: [] }
    ;(apiClient.post as jest.Mock).mockResolvedValue(list)

    const store = useListStore()
    const result = await store.createList(1, 'Doing')

    expect(apiClient.post).toHaveBeenCalledWith('/boards/1/lists', { name: 'Doing' })
    expect(result).toEqual(list)
    expect(store.lists).toEqual([list])
  })

  it('updates and deletes lists through the API', async () => {
    const store = useListStore()
    store.lists = [{ id: 1, board_id: 1, name: 'Todo', position: 1, created_at: new Date() }]

    await store.updateList(1, { name: 'Done' })
    expect(apiClient.patch).toHaveBeenCalledWith('/lists/1', { name: 'Done' })
    expect(store.lists[0].name).toBe('Done')

    await store.deleteList(1)
    expect(apiClient.delete).toHaveBeenCalledWith('/lists/1')
    expect(store.lists).toEqual([])
  })
})
