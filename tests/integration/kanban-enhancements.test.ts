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
const mockLabel = { id: 1, board_id: 1, name: 'Bug', color: '#ff0000' }

describe('Kanban Enhancements Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    ;(apiClient.get as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/lists') && !url.includes('/cards')) return Promise.resolve([mockList])
      if (url.includes('/cards')) return Promise.resolve([mockCard])
      if (url.includes('/labels')) return Promise.resolve([mockLabel])
      return Promise.resolve([])
    })
    ;(apiClient.post as jest.Mock).mockResolvedValue({})
    ;(apiClient.patch as jest.Mock).mockResolvedValue({})
    ;(apiClient.delete as jest.Mock).mockResolvedValue({})
  })

  it('renders all enhancement components', async () => {
    const wrapper = mount(BoardView)
    const boardStore = useBoardStore()
    boardStore.currentBoard = mockBoard as any
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.search-bar').exists()).toBe(true)
    expect(wrapper.find('.filter-panel').exists()).toBe(true)
    expect(wrapper.find('.view-switcher').exists()).toBe(true)
    expect(wrapper.find('.sort-selector').exists()).toBe(true)
  })

  it('switches between views', async () => {
    const wrapper = mount(BoardView)
    const boardStore = useBoardStore()
    boardStore.currentBoard = mockBoard as any
    await wrapper.vm.$nextTick()

    const viewBtns = wrapper.findAll('.view-btn')
    expect(viewBtns.length).toBe(4)

    await viewBtns[1].trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.list-view').exists()).toBe(true)
  })

  it('displays search bar with result count', async () => {
    const wrapper = mount(BoardView)
    const boardStore = useBoardStore()
    boardStore.currentBoard = mockBoard as any
    await wrapper.vm.$nextTick()

    const searchBar = wrapper.find('.search-bar')
    expect(searchBar.exists()).toBe(true)
    expect(searchBar.find('input').exists()).toBe(true)
  })

  it('displays filter panel with priority options', async () => {
    const wrapper = mount(BoardView)
    const boardStore = useBoardStore()
    boardStore.currentBoard = mockBoard as any
    await wrapper.vm.$nextTick()

    const filterPanel = wrapper.find('.filter-panel')
    expect(filterPanel.exists()).toBe(true)
    expect(filterPanel.text()).toContain('优先级')
  })

  it('displays sort selector', async () => {
    const wrapper = mount(BoardView)
    const boardStore = useBoardStore()
    boardStore.currentBoard = mockBoard as any
    await wrapper.vm.$nextTick()

    const sortSelector = wrapper.find('.sort-selector')
    expect(sortSelector.exists()).toBe(true)
    expect(sortSelector.find('select').exists()).toBe(true)
  })

  it('renders board columns when board is selected', async () => {
    const wrapper = mount(BoardView)
    const boardStore = useBoardStore()
    boardStore.currentBoard = mockBoard as any
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.board-content').exists()).toBe(true)
  })

  it('shows empty state when no board is selected', () => {
    const wrapper = mount(BoardView)
    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.find('.board-toolbar').exists()).toBe(false)
  })
})
