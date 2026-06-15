import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import LabelPicker from '@/components/board/LabelPicker.vue'

describe('LabelPicker', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders label options', () => {
    const wrapper = mount(LabelPicker, {
      props: { 
        cardId: 1,
        availableLabels: [
          { id: 1, name: 'Bug', color: '#FF0000' },
          { id: 2, name: 'Feature', color: '#00FF00' }
        ],
        selectedLabels: []
      }
    })
    expect(wrapper.findAll('.label-option').length).toBe(2)
  })
})