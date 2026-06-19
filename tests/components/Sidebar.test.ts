import { mount, flushPromises } from '@vue/test-utils'
import Sidebar from '@/components/layout/Sidebar.vue'

const fetchBoards = jest.fn()
const createBoard = jest.fn()
const setCurrentBoard = jest.fn()

jest.mock('@/stores/board', () => ({
  useBoardStore: () => ({
    boards: [],
    fetchBoards,
    createBoard,
    setCurrentBoard,
  }),
}))

const antStubs = {
  'a-layout-sider': { template: '<aside class="sidebar"><slot /></aside>' },
  'a-menu': { template: '<nav><slot /></nav>' },
  'a-menu-item': { template: '<button class="nav-item"><slot /></button>' },
  'a-badge': true,
  'a-list': true,
  'a-list-item': true,
  'a-input': true,
  'a-form': true,
  'a-form-item': true,
  'a-button': true,
  'a-dropdown': true,
}

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders sidebar component', async () => {
    const wrapper = mount(Sidebar, { global: { stubs: antStubs } })
    await flushPromises()
    expect(wrapper.find('.sidebar').exists()).toBe(true)
  })

  it('renders logo', async () => {
    const wrapper = mount(Sidebar, { global: { stubs: antStubs } })
    await flushPromises()
    expect(wrapper.find('.logo').exists()).toBe(true)
  })

  it('shows only the core board navigation entry', async () => {
    const wrapper = mount(Sidebar, { global: { stubs: antStubs } })
    await flushPromises()

    expect(wrapper.findAll('.nav-item')).toHaveLength(1)
  })
})
