import { Comment } from '@/database/entities/Comment'

describe('Comment Entity', () => {
  it('should have required fields', () => {
    const comment = new Comment()
    comment.id = 1
    comment.card_id = 1
    comment.author = 'Test User'
    comment.content = 'Test comment'
    
    expect(comment.id).toBe(1)
    expect(comment.card_id).toBe(1)
    expect(comment.author).toBe('Test User')
    expect(comment.content).toBe('Test comment')
  })

  it('should have created_at timestamp', () => {
    const comment = new Comment()
    comment.created_at = new Date()
    
    expect(comment.created_at).toBeInstanceOf(Date)
  })
})