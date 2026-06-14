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

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows a board creation form after clicking new board', async () => {
    const wrapper = mount(Sidebar, {
      global: {
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a><slot /></a>',
          },
        },
      },
    })
    await flushPromises()

    await wrapper.get('button').trigger('click')

    expect(wrapper.find('input[placeholder="看板名称"]').exists()).toBe(true)
  })

  it('creates and selects a board from the creation form', async () => {
    const createdBoard = {
      id: 42,
      name: '产品计划',
      created_at: new Date(),
      updated_at: new Date(),
      lists: [],
    }
    createBoard.mockResolvedValue(createdBoard)

    const wrapper = mount(Sidebar, {
      global: {
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a><slot /></a>',
          },
        },
      },
    })
    await flushPromises()

    await wrapper.get('button').trigger('click')
    await wrapper.get('input[placeholder="看板名称"]').setValue('产品计划')
    await wrapper.get('form').trigger('submit.prevent')
    await flushPromises()

    expect(createBoard).toHaveBeenCalledWith('产品计划')
    expect(setCurrentBoard).toHaveBeenCalledWith(createdBoard)
    expect(wrapper.find('input[placeholder="看板名称"]').exists()).toBe(false)
  })
})
