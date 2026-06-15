import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import LabelPicker from '@/components/board/LabelPicker.vue'

const mockLabels = [
  { id: 1, name: 'Bug', color: '#FF0000' },
  { id: 2, name: 'Feature', color: '#00FF00' },
  { id: 3, name: 'Enhancement', color: '#0000FF' },
  { id: 4, name: 'Documentation', color: '#FFA500' },
]

describe('LabelPicker', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders label options', () => {
    const wrapper = mount(LabelPicker, {
      props: {
        cardId: 1,
        availableLabels: mockLabels,
        selectedLabels: [],
      },
    })
    expect(wrapper.findAll('.label-option').length).toBe(4)
  })

  describe('search filtering', () => {
    it('filters labels by name when search input is provided', async () => {
      const wrapper = mount(LabelPicker, {
        props: {
          cardId: 1,
          availableLabels: mockLabels,
          selectedLabels: [],
        },
      })
      const input = wrapper.find('.label-search input')
      await input.setValue('bug')
      expect(wrapper.findAll('.label-option').length).toBe(1)
      expect(wrapper.find('.label-name').text()).toBe('Bug')
    })

    it('performs case-insensitive search', async () => {
      const wrapper = mount(LabelPicker, {
        props: {
          cardId: 1,
          availableLabels: mockLabels,
          selectedLabels: [],
        },
      })
      const input = wrapper.find('.label-search input')
      await input.setValue('FEATURE')
      expect(wrapper.findAll('.label-option').length).toBe(1)
      expect(wrapper.find('.label-name').text()).toBe('Feature')
    })

    it('shows all labels when search is empty', async () => {
      const wrapper = mount(LabelPicker, {
        props: {
          cardId: 1,
          availableLabels: mockLabels,
          selectedLabels: [],
        },
      })
      const input = wrapper.find('.label-search input')
      await input.setValue('Bug')
      expect(wrapper.findAll('.label-option').length).toBe(1)
      await input.setValue('')
      expect(wrapper.findAll('.label-option').length).toBe(4)
    })

    it('returns no results when search matches nothing', async () => {
      const wrapper = mount(LabelPicker, {
        props: {
          cardId: 1,
          availableLabels: mockLabels,
          selectedLabels: [],
        },
      })
      const input = wrapper.find('.label-search input')
      await input.setValue('xyz')
      expect(wrapper.findAll('.label-option').length).toBe(0)
    })

    it('filters multiple labels matching search term', async () => {
      const wrapper = mount(LabelPicker, {
        props: {
          cardId: 1,
          availableLabels: mockLabels,
          selectedLabels: [],
        },
      })
      const input = wrapper.find('.label-search input')
      await input.setValue('e')
      expect(wrapper.findAll('.label-option').length).toBe(3)
    })
  })

  describe('checkbox toggle behavior', () => {
    it('shows checked checkbox for selected labels', () => {
      const wrapper = mount(LabelPicker, {
        props: {
          cardId: 1,
          availableLabels: mockLabels,
          selectedLabels: [1, 3],
        },
      })
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      expect(checkboxes[0].element.checked).toBe(true)
      expect(checkboxes[1].element.checked).toBe(false)
      expect(checkboxes[2].element.checked).toBe(true)
      expect(checkboxes[3].element.checked).toBe(false)
    })

    it('emits update:selectedLabels with label added when unchecked checkbox is clicked', async () => {
      const wrapper = mount(LabelPicker, {
        props: {
          cardId: 1,
          availableLabels: mockLabels,
          selectedLabels: [],
        },
      })
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      await checkboxes[1].trigger('change')
      expect(wrapper.emitted('update:selectedLabels')).toBeTruthy()
      expect(wrapper.emitted('update:selectedLabels')![0]).toEqual([[2]])
    })

    it('emits update:selectedLabels with label removed when checked checkbox is clicked', async () => {
      const wrapper = mount(LabelPicker, {
        props: {
          cardId: 1,
          availableLabels: mockLabels,
          selectedLabels: [1, 2],
        },
      })
      const checkboxes = wrapper.findAll('input[type="checkbox"]')
      await checkboxes[0].trigger('change')
      expect(wrapper.emitted('update:selectedLabels')![0]).toEqual([[2]])
    })

    it('handles multiple toggles correctly', async () => {
      const wrapper = mount(LabelPicker, {
        props: {
          cardId: 1,
          availableLabels: mockLabels,
          selectedLabels: [1],
        },
      })
      const checkboxes = wrapper.findAll('input[type="checkbox"]')

      await checkboxes[1].trigger('change')
      expect(wrapper.emitted('update:selectedLabels')![0]).toEqual([[1, 2]])

      await wrapper.setProps({ selectedLabels: [1, 2] })

      await checkboxes[0].trigger('change')
      expect(wrapper.emitted('update:selectedLabels')![1]).toEqual([[2]])
    })

    it('allows toggling same label off and on', async () => {
      const wrapper = mount(LabelPicker, {
        props: {
          cardId: 1,
          availableLabels: mockLabels,
          selectedLabels: [1],
        },
      })
      const checkboxes = wrapper.findAll('input[type="checkbox"]')

      await checkboxes[0].trigger('change')
      expect(wrapper.emitted('update:selectedLabels')![0]).toEqual([[]])

      await wrapper.setProps({ selectedLabels: [] })

      await checkboxes[0].trigger('change')
      expect(wrapper.emitted('update:selectedLabels')![1]).toEqual([[1]])
    })
  })
})
