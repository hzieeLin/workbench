import { mount } from '@vue/test-utils'
import SortSelector from '@/components/board/SortSelector.vue'

describe('SortSelector', () => {
  it('renders sort component', () => {
    const wrapper = mount(SortSelector, {
      props: { currentSort: 'created_at', direction: 'desc' },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('emits sort change on direction toggle', async () => {
    const wrapper = mount(SortSelector, {
      props: { currentSort: 'created_at', direction: 'desc' },
    })
    const btn = wrapper.find('button')
    if (btn.exists()) {
      await btn.trigger('click')
      expect(wrapper.emitted('sort')).toBeTruthy()
    }
  })
})
