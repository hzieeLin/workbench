import { createPinia, setActivePinia } from 'pinia'
import { apiClient } from '@/services/api'
import { localDateKey, useFocusStore } from '@/stores/focus'

jest.mock('@/services/api', () => ({
  apiClient: {
    get: jest.fn(),
    put: jest.fn(),
  },
}))

const response = {
  date: '2026-06-18',
  items: [
    {
      card: { id: 3, list_id: 1, title: '聚焦任务', priority: 'medium', position: 1 },
      source: 'automatic' as const,
      overdue: true,
    },
  ],
  total: 1,
  overdueCount: 1,
}

describe('focus store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.clearAllMocks()
  })

  it('formats a date using local calendar parts', () => {
    expect(localDateKey(new Date(2026, 5, 8, 23, 30))).toBe('2026-06-08')
  })

  it('loads focus items for a board and date', async () => {
    ;(apiClient.get as jest.Mock).mockResolvedValue(response)
    const store = useFocusStore()

    await store.fetchFocus(7, '2026-06-18')

    expect(apiClient.get).toHaveBeenCalledWith('/boards/7/focus?date=2026-06-18')
    expect(store.items).toEqual(response.items)
    expect(store.currentDate).toBe('2026-06-18')
    expect(store.overdueCount).toBe(1)
    expect(store.loading).toBe(false)
  })

  it('preserves existing items when refresh fails', async () => {
    const store = useFocusStore()
    store.items = response.items as any
    ;(apiClient.get as jest.Mock).mockRejectedValue(new Error('无法加载'))

    await store.fetchFocus(7, '2026-06-18')

    expect(store.items).toEqual(response.items)
    expect(store.error).toBe('无法加载')
  })

  it('writes a daily override then refreshes authoritative state', async () => {
    ;(apiClient.put as jest.Mock).mockResolvedValue({ focused: true })
    ;(apiClient.get as jest.Mock).mockResolvedValue(response)
    const store = useFocusStore()

    const operation = store.setFocus(3, 'include', 7, '2026-06-18')
    expect(store.savingCardIds).toContain(3)
    await operation

    expect(apiClient.put).toHaveBeenCalledWith('/cards/3/focus', {
      date: '2026-06-18',
      mode: 'include',
    })
    expect(apiClient.get).toHaveBeenCalledWith('/boards/7/focus?date=2026-06-18')
    expect(store.savingCardIds).not.toContain(3)
    expect(store.isFocused(3)).toBe(true)
  })

  it('clears board-specific state', () => {
    const store = useFocusStore()
    store.items = response.items as any
    store.error = 'old error'
    store.currentDate = '2026-06-18'

    store.clear()

    expect(store.items).toEqual([])
    expect(store.error).toBeNull()
    expect(store.currentDate).toBe('')
  })
})
