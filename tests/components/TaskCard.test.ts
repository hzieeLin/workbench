import { mount } from '@vue/test-utils'
import TaskCard from '@/components/board/TaskCard.vue'

describe('TaskCard', () => {
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

  it('renders card title', () => {
    const wrapper = mount(TaskCard, {
      props: { card: mockCard },
    })
    expect(wrapper.text()).toContain('Test Card')
  })

  it('applies high-priority class for high priority', () => {
    const wrapper = mount(TaskCard, {
      props: { card: { ...mockCard, priority: 'high' } },
    })
    expect(wrapper.classes()).toContain('high-priority')
  })

  it('does not apply high-priority class for low priority', () => {
    const wrapper = mount(TaskCard, {
      props: { card: { ...mockCard, priority: 'low' } },
    })
    expect(wrapper.classes()).not.toContain('high-priority')
  })

  it('does not apply high-priority class for medium priority', () => {
    const wrapper = mount(TaskCard, {
      props: { card: { ...mockCard, priority: 'medium' } },
    })
    expect(wrapper.classes()).not.toContain('high-priority')
  })

  it('renders priority text correctly for high', () => {
    const wrapper = mount(TaskCard, {
      props: { card: { ...mockCard, priority: 'high' } },
    })
    expect(wrapper.text()).toContain('高')
  })

  it('renders priority text correctly for medium', () => {
    const wrapper = mount(TaskCard, {
      props: { card: { ...mockCard, priority: 'medium' } },
    })
    expect(wrapper.text()).toContain('中')
  })

  it('renders priority text correctly for low', () => {
    const wrapper = mount(TaskCard, {
      props: { card: { ...mockCard, priority: 'low' } },
    })
    expect(wrapper.text()).toContain('低')
  })

  it('renders due date when provided', () => {
    const dueDate = new Date('2024-01-15')
    const wrapper = mount(TaskCard, {
      props: { card: { ...mockCard, due_date: dueDate } },
    })
    expect(wrapper.text()).toContain('日程')
  })

  it('does not render due date when not provided', () => {
    const wrapper = mount(TaskCard, {
      props: { card: { ...mockCard, due_date: undefined } },
    })
    expect(wrapper.text()).not.toContain('日程')
  })

  it('has task-card class', () => {
    const wrapper = mount(TaskCard, {
      props: { card: mockCard },
    })
    expect(wrapper.classes()).toContain('task-card')
  })
})
