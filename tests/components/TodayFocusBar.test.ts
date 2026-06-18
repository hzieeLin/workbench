import { mount } from '@vue/test-utils'
import TodayFocusBar from '@/components/board/TodayFocusBar.vue'

const card = (id: number, title = `任务 ${id}`, listId = 1) => ({
  id,
  list_id: listId,
  title,
  priority: 'medium' as const,
  position: id,
  created_at: new Date(),
  updated_at: new Date(),
})

describe('TodayFocusBar', () => {
  it('shows a directional empty state', () => {
    const wrapper = mount(TodayFocusBar, {
      props: { items: [], cards: [], completedListIds: [], overdueCount: 0 },
    })

    expect(wrapper.text()).toContain('今天还没有聚焦任务')
    expect(wrapper.text()).toContain('选择任务')
  })

  it('shows overdue count and soft advice above three items', () => {
    const items = [1, 2, 3, 4].map((id) => ({
      card: card(id),
      source: 'automatic' as const,
      overdue: id === 1,
    }))
    const wrapper = mount(TodayFocusBar, {
      props: { items, cards: items.map((item) => item.card), completedListIds: [], overdueCount: 1 },
    })

    expect(wrapper.text()).toContain('1 项逾期')
    expect(wrapper.text()).toContain('建议保留最重要的 3 项')
  })

  it('opens a card and removes it without triggering the card action', async () => {
    const focusedCard = card(1)
    const wrapper = mount(TodayFocusBar, {
      props: {
        items: [{ card: focusedCard, source: 'manual', overdue: false }],
        cards: [focusedCard],
        completedListIds: [],
        overdueCount: 0,
      },
    })

    await wrapper.get('[data-testid="focus-card-1"]').trigger('click')
    expect(wrapper.emitted('open-card')).toEqual([[focusedCard]])

    await wrapper.get('[data-testid="focus-remove-1"]').trigger('click')
    expect(wrapper.emitted('exclude')).toEqual([[1]])
    expect(wrapper.emitted('open-card')).toHaveLength(1)
  })

  it('offers only unfinished, unfocused cards in the selector', async () => {
    const wrapper = mount(TodayFocusBar, {
      props: {
        items: [{ card: card(1), source: 'manual', overdue: false }],
        cards: [card(1), card(2, '可选择任务'), card(3, '完成任务', 9)],
        completedListIds: [9],
        overdueCount: 0,
      },
    })

    await wrapper.get('[data-testid="focus-picker-toggle"]').trigger('click')
    expect(wrapper.text()).toContain('可选择任务')
    expect(wrapper.text()).not.toContain('完成任务')

    await wrapper.get('[data-testid="focus-option-2"]').trigger('click')
    expect(wrapper.emitted('include')).toEqual([[2]])
  })

  it('keeps failures inside the focus surface and supports retry', async () => {
    const wrapper = mount(TodayFocusBar, {
      props: {
        items: [],
        cards: [],
        completedListIds: [],
        overdueCount: 0,
        error: '网络不可用',
      },
    })

    expect(wrapper.text()).toContain('聚焦任务加载失败')
    await wrapper.get('[data-testid="focus-retry"]').trigger('click')
    expect(wrapper.emitted('retry')).toHaveLength(1)
  })
})
