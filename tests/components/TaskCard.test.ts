import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import TaskCard from '@/components/board/TaskCard.vue'

describe('TaskCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  const mockCard = {
    id: 1,
    list_id: 1,
    title: 'Test Card',
    description: 'Test description',
    priority: 'medium' as const,
    position: 1,
    created_at: new Date(),
    updated_at: new Date(),
  }

  it('renders task card component', () => {
    const wrapper = mount(TaskCard, {
      props: { card: mockCard },
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('has task-card class', () => {
    const wrapper = mount(TaskCard, {
      props: { card: mockCard },
    })
    expect(wrapper.classes()).toContain('task-card')
  })

  it('applies priority class for high priority', () => {
    const wrapper = mount(TaskCard, {
      props: { card: { ...mockCard, priority: 'high' } },
    })
    expect(wrapper.classes()).toContain('priority-high')
  })

  it('applies priority class for medium priority', () => {
    const wrapper = mount(TaskCard, {
      props: { card: { ...mockCard, priority: 'medium' } },
    })
    expect(wrapper.classes()).toContain('priority-medium')
  })

  it('applies priority class for low priority', () => {
    const wrapper = mount(TaskCard, {
      props: { card: { ...mockCard, priority: 'low' } },
    })
    expect(wrapper.classes()).toContain('priority-low')
  })
})
