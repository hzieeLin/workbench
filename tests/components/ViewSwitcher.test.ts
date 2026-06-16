import { mount } from '@vue/test-utils'
import ViewSwitcher from '@/components/board/ViewSwitcher.vue'

describe('ViewSwitcher', () => {
  it('renders view switcher', () => {
    const wrapper = mount(ViewSwitcher, {
      props: { currentView: 'board' },
    })
    expect(wrapper.exists()).toBe(true)
  })
})
