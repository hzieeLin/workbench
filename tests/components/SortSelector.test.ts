import { mount } from '@vue/test-utils'
import SortSelector from '@/components/board/SortSelector.vue'

describe('SortSelector', () => {
  it('renders sort options', () => {
    const wrapper = mount(SortSelector, {
      props: { currentSort: 'created_at', direction: 'desc' }
    })
    expect(wrapper.find('select').exists()).toBe(true)
  })

  it('emits sort change on selection', async () => {
    const wrapper = mount(SortSelector, {
      props: { currentSort: 'created_at', direction: 'desc' }
    })
    await wrapper.find('select').setValue('priority')
    expect(wrapper.emitted('sort')).toBeTruthy()
  })
})
