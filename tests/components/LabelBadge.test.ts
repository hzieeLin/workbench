import { mount } from '@vue/test-utils'
import LabelBadge from '@/components/board/LabelBadge.vue'

const mockLabels = [
  { id: 1, name: 'Bug', color: '#FF0000' },
  { id: 2, name: 'Feature', color: '#00FF00' },
  { id: 3, name: 'Urgent', color: '#0000FF' },
  { id: 4, name: 'Backend', color: '#FFA500' },
  { id: 5, name: 'Frontend', color: '#800080' },
]

describe('LabelBadge', () => {
  it('renders labels with correct text and colors', () => {
    const wrapper = mount(LabelBadge, {
      props: {
        labels: mockLabels.slice(0, 2),
      },
    })
    const badges = wrapper.findAll('.label-badge')
    expect(badges.length).toBe(2)
    expect(badges[0].text()).toBe('Bug')
    expect(badges[0].attributes('style')).toContain('background-color')
    expect(badges[1].text()).toBe('Feature')
    expect(badges[1].attributes('style')).toContain('background-color')
  })

  it('renders nothing when labels is empty', () => {
    const wrapper = mount(LabelBadge, {
      props: {
        labels: [],
      },
    })
    expect(wrapper.find('.label-badges').exists()).toBe(false)
  })

  it('shows max 3 labels by default', () => {
    const wrapper = mount(LabelBadge, {
      props: {
        labels: mockLabels,
      },
    })
    const badges = wrapper.findAll('.label-badge:not(.overflow)')
    expect(badges.length).toBe(3)
    expect(badges[0].text()).toBe('Bug')
    expect(badges[1].text()).toBe('Feature')
    expect(badges[2].text()).toBe('Urgent')
  })

  it('shows overflow count when labels exceed maxDisplay', () => {
    const wrapper = mount(LabelBadge, {
      props: {
        labels: mockLabels,
        maxDisplay: 2,
      },
    })
    const overflow = wrapper.find('.label-badge.overflow')
    expect(overflow.exists()).toBe(true)
    expect(overflow.text()).toContain('+3')
  })

  it('does not show overflow when labels count equals maxDisplay', () => {
    const wrapper = mount(LabelBadge, {
      props: {
        labels: mockLabels.slice(0, 3),
        maxDisplay: 3,
      },
    })
    expect(wrapper.find('.label-badge.overflow').exists()).toBe(false)
  })

  it('does not show overflow when labels count less than maxDisplay', () => {
    const wrapper = mount(LabelBadge, {
      props: {
        labels: mockLabels.slice(0, 2),
        maxDisplay: 3,
      },
    })
    expect(wrapper.find('.label-badge.overflow').exists()).toBe(false)
  })

  it('uses custom maxDisplay when provided', () => {
    const wrapper = mount(LabelBadge, {
      props: {
        labels: mockLabels,
        maxDisplay: 4,
      },
    })
    const badges = wrapper.findAll('.label-badge:not(.overflow)')
    expect(badges.length).toBe(4)
    const overflow = wrapper.find('.label-badge.overflow')
    expect(overflow.text()).toContain('+1')
  })

  it('shows all labels when maxDisplay is greater than labels count', () => {
    const wrapper = mount(LabelBadge, {
      props: {
        labels: mockLabels.slice(0, 2),
        maxDisplay: 10,
      },
    })
    const badges = wrapper.findAll('.label-badge:not(.overflow)')
    expect(badges.length).toBe(2)
    expect(wrapper.find('.label-badge.overflow').exists()).toBe(false)
  })
})
