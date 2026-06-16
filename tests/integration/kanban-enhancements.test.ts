import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import BoardView from '@/views/BoardView.vue'
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
      if (url.includes('/lists') && !url.includes('/cards')) return Promise.resolve([mockList])
      if (url.includes('/cards')) return Promise.resolve([mockCard])
      return Promise.resolve([])
    })
    ;(apiClient.post as jest.Mock).mockResolvedValue({})
    ;(apiClient.patch as jest.Mock).mockResolvedValue({})
    ;(apiClient.delete as jest.Mock).mockResolvedValue({})
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
})
