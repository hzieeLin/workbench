import { setActivePinia, createPinia } from 'pinia'
import { useCardStore } from '@/stores/card'
import { db } from '@/database/db'

jest.mock('@/database/db', () => ({
  db: {
    cards: {
      find: jest.fn().mockReturnValue([]),
      create: jest.fn().mockImplementation((data) => ({
        id: 1,
        ...data,
        created_at: new Date(),
        updated_at: new Date(),
        priority: data.priority || 'medium',
        cardLabels: [],
        timeBlocks: [],
      })),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
      moveCard: jest.fn().mockResolvedValue(undefined),
    },
    lists: {
      find: jest.fn().mockReturnValue([]),
    },
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
    const find = db.cards.find as jest.Mock
    find.mockReturnValue(mockCards)

    const store = useCardStore()
    await store.fetchCards(1)

    expect(store.cards).toContainEqual(mockCards[0])
    expect(store.cards).toContainEqual(mockCards[1])
    expect(store.loading).toBe(false)
  })

  it('creates a card successfully', async () => {
    const store = useCardStore()
    const newCard = await store.createCard(1, 'New Card', 'Description')

    expect(newCard).toBeDefined()
    expect(newCard.title).toBe('New Card')
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

    expect(store.cards).toEqual([])
  })

  it('handles fetch error', async () => {
    const find = db.cards.find as jest.Mock
    find.mockImplementation(() => {
      throw new Error('Database error')
    })

    const store = useCardStore()
    await store.fetchCards(1)

    expect(store.error).toBe('Database error')
    expect(store.loading).toBe(false)
  })
})
