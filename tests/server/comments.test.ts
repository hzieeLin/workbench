/**
 * @jest-environment node
 */

import request from 'supertest'
import { createApp } from '../../server/app'
import { Board } from '../../src/database/entities/Board'
import { Card } from '../../src/database/entities/Card'
import { Comment } from '../../src/database/entities/Comment'
import { List } from '../../src/database/entities/List'

type RepoOptions<T> = {
  where?: Partial<T>
  order?: Partial<Record<keyof T, 'ASC' | 'DESC'>>
}

function createRepo<T extends { id?: number }>() {
  let nextId = 1
  const rows: T[] = []

  return {
    rows,
    find: jest.fn(async (options?: RepoOptions<T>) => {
      let result = [...rows]
      if (options?.where) {
        result = result.filter((row) =>
          Object.entries(options.where as Record<string, unknown>).every(
            ([key, value]) => (row as Record<string, unknown>)[key] === value
          )
        )
      }

      const [orderEntry] = Object.entries(options?.order ?? {})
      if (orderEntry) {
        const [key, direction] = orderEntry as [keyof T, 'ASC' | 'DESC']
        result.sort((left, right) => {
          const leftValue = left[key] as number | string | Date
          const rightValue = right[key] as number | string | Date
          if (leftValue === rightValue) return 0
          const result = leftValue > rightValue ? 1 : -1
          return direction === 'DESC' ? -result : result
        })
      }

      return result
    }),
    create: jest.fn((data: Partial<T>) => data as T),
    save: jest.fn(async (entity: T) => {
      const saved = { ...entity, id: entity.id ?? nextId++ } as T
      rows.push(saved)
      return saved
    }),
    delete: jest.fn(async (id: number) => {
      const index = rows.findIndex((row) => row.id === id)
      if (index !== -1) rows.splice(index, 1)
    }),
  }
}

describe('Comment API', () => {
  function createTestApp() {
    const boardRepo = createRepo<any>()
    const listRepo = createRepo<any>()
    const cardRepo = createRepo<any>()
    const commentRepo = createRepo<any>()
    const dataSource = {
      getRepository(entity: unknown) {
        if (entity === Board) return boardRepo
        if (entity === List) return listRepo
        if (entity === Card) return cardRepo
        if (entity === Comment) return commentRepo
        throw new Error('Unexpected repository')
      },
    } as any
    return { app: createApp(dataSource), commentRepo, cardRepo, listRepo }
  }

  it('should create a comment', async () => {
    const { app } = createTestApp()

    const res = await request(app)
      .post('/api/cards/1/comments')
      .send({ author: 'Test User', content: 'Test comment' })

    expect(res.status).toBe(201)
    expect(res.body.content).toBe('Test comment')
    expect(res.body.author).toBe('Test User')
  })

  it('should default author to 用户 when not provided', async () => {
    const { app } = createTestApp()

    const res = await request(app)
      .post('/api/cards/1/comments')
      .send({ content: 'No author comment' })

    expect(res.status).toBe(201)
    expect(res.body.author).toBe('用户')
  })

  it('should get comments for a card', async () => {
    const { app, commentRepo } = createTestApp()
    commentRepo.rows.push(
      { id: 1, card_id: 1, author: 'User A', content: 'First comment', created_at: new Date() },
      { id: 2, card_id: 1, author: 'User B', content: 'Second comment', created_at: new Date() }
    )

    const res = await request(app).get('/api/cards/1/comments')

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBe(2)
  })

  it('should only return comments for the specified card', async () => {
    const { app, commentRepo } = createTestApp()
    commentRepo.rows.push(
      { id: 1, card_id: 1, author: 'User', content: 'Card 1 comment', created_at: new Date() },
      { id: 2, card_id: 2, author: 'User', content: 'Card 2 comment', created_at: new Date() }
    )

    const res = await request(app).get('/api/cards/1/comments')

    expect(res.status).toBe(200)
    expect(res.body.length).toBe(1)
    expect(res.body[0].card_id).toBe(1)
  })

  it('should delete a comment', async () => {
    const { app, commentRepo } = createTestApp()
    commentRepo.rows.push({
      id: 1,
      card_id: 1,
      author: 'Test User',
      content: 'To delete',
      created_at: new Date(),
    })

    const deleteRes = await request(app).delete('/api/comments/1')

    expect(deleteRes.status).toBe(200)
    expect(deleteRes.body).toEqual({ ok: true })
    expect(commentRepo.rows.length).toBe(0)
  })

  it('should return empty array for card with no comments', async () => {
    const { app } = createTestApp()

    const res = await request(app).get('/api/cards/999/comments')

    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })
})
