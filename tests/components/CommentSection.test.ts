import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CommentSection from '@/components/board/CommentSection.vue'

describe('CommentSection', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders comment list', () => {
    const wrapper = mount(CommentSection, {
      props: { cardId: 1 }
    })
    expect(wrapper.find('.comment-section').exists()).toBe(true)
  })

  it('shows comment form', () => {
    const wrapper = mount(CommentSection, {
      props: { cardId: 1 }
    })
    expect(wrapper.find('.comment-form').exists()).toBe(true)
  })
})
