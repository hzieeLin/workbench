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

jest.mock('vue-router', () => ({
  useRoute: () => ({
    path: '/',
  }),
}))

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders sidebar component', async () => {
    const wrapper = mount(Sidebar)
    await flushPromises()
    expect(wrapper.find('.sidebar').exists()).toBe(true)
  })

  it('renders logo', async () => {
    const wrapper = mount(Sidebar)
    await flushPromises()
    expect(wrapper.find('.logo').exists()).toBe(true)
  })
})
