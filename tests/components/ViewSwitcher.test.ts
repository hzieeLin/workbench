import { mount } from '@vue/test-utils'
import ViewSwitcher from '@/components/board/ViewSwitcher.vue'

describe('ViewSwitcher', () => {
  it('renders view switcher', () => {
    const wrapper = mount(ViewSwitcher, {
      props: { currentView: 'board' },
      global: {
        stubs: {
          'a-segmented': {
            name: 'ASegmented',
            props: ['options'],
            template: '<div />',
          },
        },
      },
    })

    const values = wrapper.findComponent({ name: 'ASegmented' }).props('options') as Array<{
      value: string
    }>
    expect(values.map((option) => option.value)).toEqual(['board', 'list'])
  })
})
