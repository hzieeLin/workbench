import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import LabelManager from '@/components/board/LabelManager.vue'

jest.mock('@/stores/label', () => ({
  useLabelStore: () => ({
    labels: [],
    fetchLabels: jest.fn(),
    createLabel: jest.fn(),
    deleteLabel: jest.fn(),
  }),
}))

describe('LabelManager', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders label list', () => {
    const wrapper = mount(LabelManager, {
      props: { boardId: 1 },
    })
    expect(wrapper.find('.label-list').exists()).toBe(true)
  })

  it('shows create form when button clicked', async () => {
    const wrapper = mount(LabelManager, {
      props: { boardId: 1 },
    })
    await flushPromises()
    await wrapper.find('.create-btn').trigger('click')
    expect(wrapper.find('.create-form').exists()).toBe(true)
  })
})
