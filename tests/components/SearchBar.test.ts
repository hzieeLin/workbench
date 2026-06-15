import { mount } from '@vue/test-utils'
import SearchBar from '@/components/board/SearchBar.vue'

describe('SearchBar', () => {
  it('emits search event on input', async () => {
    const wrapper = mount(SearchBar)
    await wrapper.find('input').setValue('test')
    // Wait for debounce (300ms)
    await new Promise(resolve => setTimeout(resolve, 400))
    expect(wrapper.emitted('search')).toBeTruthy()
    expect(wrapper.emitted('search')![0]).toEqual(['test'])
  })

  it('clears search on button click', async () => {
    const wrapper = mount(SearchBar)
    await wrapper.find('input').setValue('test')
    await wrapper.find('.clear-btn').trigger('click')
    expect(wrapper.find('input').element.value).toBe('')
  })
})