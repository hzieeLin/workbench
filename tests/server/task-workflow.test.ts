/**
 * @jest-environment node
 */

import request from 'supertest'
import { createApp } from '../../server/app'
import { Board } from '../../src/database/entities/Board'
import { Card } from '../../src/database/entities/Card'
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
    update: jest.fn(async (id: number, data: Partial<T>) => {
      const index = rows.findIndex((row) => row.id === id)
      if (index !== -1) rows[index] = { ...rows[index], ...data }
    }),
    delete: jest.fn(async (id: number) => {
      const index = rows.findIndex((row) => row.id === id)
      if (index !== -1) rows.splice(index, 1)
    }),
  }
}

describe('task workflow API', () => {
  it('creates a board, list, and card', async () => {
    const boardRepo = createRepo<any>()
    const listRepo = createRepo<any>()
    const cardRepo = createRepo<any>()
    const dataSource = {
      getRepository(entity: unknown) {
        if (entity === Board) return boardRepo
        if (entity === List) return listRepo
        if (entity === Card) return cardRepo
        throw new Error('Unexpected repository')
      },
    } as any
    const app = createApp(dataSource)

    const board = await request(app).post('/api/boards').send({ name: 'Product Plan' }).expect(201)
    const list = await request(app)
      .post(`/api/boards/${board.body.id}/lists`)
      .send({ name: 'Todo' })
      .expect(201)
    const card = await request(app)
      .post(`/api/lists/${list.body.id}/cards`)
      .send({ title: 'First task' })
      .expect(201)

    expect(card.body).toMatchObject({
      list_id: list.body.id,
      title: 'First task',
      priority: 'medium',
      position: 1,
    })
  })

  it('rejects missing names and titles', async () => {
    const dataSource = {
      getRepository() {
        return createRepo<any>()
      },
    } as any
    const app = createApp(dataSource)

    await request(app).post('/api/boards').send({ name: '   ' }).expect(400)
    await request(app).post('/api/boards/1/lists').send({ name: '' }).expect(400)
    await request(app).post('/api/lists/1/cards').send({ title: '' }).expect(400)
  })
})
