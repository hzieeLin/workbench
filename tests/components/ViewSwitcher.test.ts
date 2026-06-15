import { mount } from '@vue/test-utils'
import ViewSwitcher from '@/components/board/ViewSwitcher.vue'

describe('ViewSwitcher', () => {
  it('renders view options', () => {
    const wrapper = mount(ViewSwitcher, {
      props: { currentView: 'board' }
    })
    expect(wrapper.findAll('.view-btn').length).toBe(4)
  })

  it('emits change event on click', async () => {
    const wrapper = mount(ViewSwitcher, {
      props: { currentView: 'board' }
    })
    await wrapper.findAll('.view-btn')[1].trigger('click')
    expect(wrapper.emitted('change')).toBeTruthy()
    expect(wrapper.emitted('change')![0]).toEqual(['list'])
  })
})
