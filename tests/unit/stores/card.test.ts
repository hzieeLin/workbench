import { setActivePinia, createPinia } from 'pinia'
import { useCardStore } from '@/stores/card'
import { apiClient } from '@/services/api'

jest.mock('@/services/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}))

describe('Card Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.clearAllMocks()
  })

  it('initializes with empty cards', () => {
    const store = useCardStore()
    expect(store.cards).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('fetches cards for a list', async () => {
    const mockCards = [
      {
        id: 1,
        list_id: 1,
        title: 'Card 1',
        position: 1,
        priority: 'medium',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        list_id: 1,
        title: 'Card 2',
        position: 2,
        priority: 'high',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]
    ;(apiClient.get as jest.Mock).mockResolvedValue(mockCards)

    const store = useCardStore()
    await store.fetchCards(1)

    expect(apiClient.get).toHaveBeenCalledWith('/lists/1/cards')
    expect(store.cards).toContainEqual(mockCards[0])
    expect(store.cards).toContainEqual(mockCards[1])
    expect(store.loading).toBe(false)
  })

  it('creates a card successfully', async () => {
    const newCard = {
      id: 1,
      list_id: 1,
      title: 'New Card',
      description: 'Description',
      position: 1,
      priority: 'medium',
      created_at: new Date(),
      updated_at: new Date(),
    }
    ;(apiClient.post as jest.Mock).mockResolvedValue(newCard)

    const store = useCardStore()
    const result = await store.createCard(1, 'New Card', 'Description')

    expect(apiClient.post).toHaveBeenCalledWith('/lists/1/cards', {
      title: 'New Card',
      description: 'Description',
    })
    expect(result).toEqual(newCard)
    expect(store.cards).toContainEqual(newCard)
  })

  it('updates a card successfully', async () => {
    const store = useCardStore()
    store.cards = [
      {
        id: 1,
        list_id: 1,
        title: 'Old Title',
        position: 1,
        priority: 'low',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]

    await store.updateCard(1, { title: 'New Title' })

    expect(apiClient.patch).toHaveBeenCalledWith('/cards/1', { title: 'New Title' })
    expect(store.cards[0].title).toBe('New Title')
  })

  it('deletes a card successfully', async () => {
    const store = useCardStore()
    store.cards = [
      {
        id: 1,
        list_id: 1,
        title: 'Card to delete',
        position: 1,
        priority: 'medium',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]

    await store.deleteCard(1)

    expect(apiClient.delete).toHaveBeenCalledWith('/cards/1')
    expect(store.cards).toEqual([])
  })

  it('handles fetch error', async () => {
    ;(apiClient.get as jest.Mock).mockRejectedValue(new Error('API error'))

    const store = useCardStore()
    await store.fetchCards(1)

    expect(store.error).toBe('API error')
    expect(store.loading).toBe(false)
  })

  it('moves a card through the API and updates local state', async () => {
    const store = useCardStore()
    store.cards = [
      {
        id: 1,
        list_id: 1,
        title: 'Move me',
        position: 1,
        priority: 'medium',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]

    await store.moveCard(1, 2, 3)

    expect(apiClient.post).toHaveBeenCalledWith('/cards/1/move', { list_id: 2, position: 3 })
    expect(store.cards[0]).toMatchObject({ id: 1, list_id: 2, position: 3 })
  })
})
