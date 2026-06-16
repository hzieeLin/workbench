import { mount } from '@vue/test-utils'
import SearchBar from '@/components/board/SearchBar.vue'

describe('SearchBar', () => {
  it('renders search input', () => {
    const wrapper = mount(SearchBar)
    expect(wrapper.find('.search-bar').exists()).toBe(true)
  })

  it('emits search event on search', async () => {
    const wrapper = mount(SearchBar)
    const input = wrapper.find('input')
    if (input.exists()) {
      await input.setValue('test')
      await new Promise((resolve) => setTimeout(resolve, 400))
      expect(wrapper.emitted('search')).toBeTruthy()
    }
  })
})
