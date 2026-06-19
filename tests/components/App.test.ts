import { shallowMount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import App from '@/App.vue'
import BoardView from '@/views/BoardView.vue'

jest.mock('ant-design-vue/es/locale/zh_CN', () => ({
  __esModule: true,
  default: {},
}))

describe('App', () => {
  it('renders the core board directly without a router', () => {
    const wrapper = shallowMount(App, {
      global: {
        plugins: [createPinia()],
        stubs: {
          'a-config-provider': { template: '<div><slot /></div>' },
          AppLayout: { template: '<div><slot /></div>' },
        },
      },
    })

    expect(wrapper.findComponent(BoardView).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'RouterView' }).exists()).toBe(false)
  })
})
