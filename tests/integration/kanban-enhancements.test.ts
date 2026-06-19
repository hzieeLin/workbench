import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import BoardView from '@/views/BoardView.vue'
import BoardColumn from '@/components/board/BoardColumn.vue'
import { useBoardStore } from '@/stores/board'
import { localDateKey } from '@/stores/focus'
import { apiClient } from '@/services/api'

jest.mock('@/services/api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}))

const mockBoard = { id: 1, name: 'Test Board', created_at: new Date() }
const mockList = { id: 1, board_id: 1, name: 'Test List', position: 1, created_at: new Date() }
const mockCard = {
  id: 1,
  list_id: 1,
  title: 'Test Card',
  description: 'Test description',
  priority: 'medium' as const,
  position: 1,
  created_at: new Date(),
  updated_at: new Date(),
}

describe('Kanban Enhancements Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    ;(apiClient.get as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/focus')) {
        return Promise.resolve({
          date: localDateKey(),
          items: [{ card: mockCard, source: 'automatic', overdue: true }],
          total: 1,
          overdueCount: 1,
        })
      }
      if (url.includes('/lists') && !url.includes('/cards')) return Promise.resolve([mockList])
      if (url.includes('/cards')) return Promise.resolve([mockCard])
      return Promise.resolve([])
    })
    ;(apiClient.post as jest.Mock).mockResolvedValue({})
    ;(apiClient.patch as jest.Mock).mockResolvedValue({})
    ;(apiClient.put as jest.Mock).mockResolvedValue({})
    ;(apiClient.delete as jest.Mock).mockResolvedValue({})
    localStorage.clear()
  })

  it('renders board view', async () => {
    const wrapper = mount(BoardView)
    const boardStore = useBoardStore()
    boardStore.currentBoard = mockBoard as any
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.board-view').exists()).toBe(true)
  })

  it('shows empty state when no board is selected', () => {
    const wrapper = mount(BoardView)
    expect(wrapper.find('.empty-state').exists()).toBe(true)
  })

  it('renders board content when board is selected', async () => {
    const wrapper = mount(BoardView)
    const boardStore = useBoardStore()
    boardStore.currentBoard = mockBoard as any
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.board-content').exists()).toBe(true)
  })

  it('loads and renders today focus without blocking the board', async () => {
    const boardStore = useBoardStore()
    boardStore.currentBoard = mockBoard as any

    const wrapper = mount(BoardView)
    await flushPromises()

    expect(apiClient.get).toHaveBeenCalledWith(`/boards/1/focus?date=${localDateKey()}`)
    expect(wrapper.text()).toContain('今日聚焦')
    expect(wrapper.text()).toContain('Test Card')
    expect(wrapper.text()).toContain('1 项逾期')
  })

  it('refreshes focus when a list completion name changes', async () => {
    const boardStore = useBoardStore()
    boardStore.currentBoard = mockBoard as any
    const wrapper = mount(BoardView)
    await flushPromises()
    ;(apiClient.get as jest.Mock).mockClear()

    wrapper.findComponent(BoardColumn).vm.$emit('list-changed')
    await flushPromises()

    expect(apiClient.get).toHaveBeenCalledWith(`/boards/1/focus?date=${localDateKey()}`)
  })
})
