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
        if (entity === Comment) return createRepo<any>()
        return createRepo<any>()
      },
      async transaction(work: (manager: any) => Promise<any>) {
        return work(this)
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

  it('rejects invalid card updates and moves', async () => {
    const boardRepo = createRepo<any>()
    const listRepo = createRepo<any>()
    const cardRepo = createRepo<any>()
    cardRepo.rows.push({ id: 1, list_id: 1, title: 'Task', priority: 'medium', position: 1 })
    const dataSource = {
      getRepository(entity: unknown) {
        if (entity === Board) return boardRepo
        if (entity === List) return listRepo
        if (entity === Card) return cardRepo
        if (entity === Comment) return createRepo<any>()
        return createRepo<any>()
      },
    } as any
    const app = createApp(dataSource)

    await request(app).patch('/api/cards/1').send({ priority: 'urgent' }).expect(400)
    await request(app).post('/api/cards/1/move').send({ list_id: 2 }).expect(400)
    await request(app).post('/api/cards/99/move').send({ list_id: 2, position: 1 }).expect(404)
  })

  it('deletes child rows before deleting parent boards and lists', async () => {
    const boardRepo = createRepo<any>()
    const listRepo = createRepo<any>()
    const cardRepo = createRepo<any>()
    boardRepo.rows.push({ id: 1, name: 'Product Plan' })
    listRepo.rows.push({ id: 2, board_id: 1, name: 'Todo', position: 1 })
    cardRepo.rows.push({ id: 3, list_id: 2, title: 'Task', position: 1 })
    const dataSource = {
      getRepository(entity: unknown) {
        if (entity === Board) return boardRepo
        if (entity === List) return listRepo
        if (entity === Card) return cardRepo
        if (entity === Comment) return createRepo<any>()
        return createRepo<any>()
      },
    } as any
    const app = createApp(dataSource)

    await request(app).delete('/api/boards/1').expect(200)

    expect(cardRepo.delete).toHaveBeenCalledWith(3)
    expect(listRepo.delete).toHaveBeenCalledWith(2)
    expect(boardRepo.delete).toHaveBeenCalledWith(1)

    boardRepo.rows.push({ id: 4, name: 'Second Board' })
    listRepo.rows.push({ id: 5, board_id: 4, name: 'Doing', position: 1 })
    cardRepo.rows.push({ id: 6, list_id: 5, title: 'Second Task', position: 1 })

    await request(app).delete('/api/lists/5').expect(200)

    expect(cardRepo.delete).toHaveBeenCalledWith(6)
    expect(listRepo.delete).toHaveBeenCalledWith(5)
  })

  it('reindexes cards when moving across lists', async () => {
    const boardRepo = createRepo<any>()
    const listRepo = createRepo<any>()
    const cardRepo = createRepo<any>()
    cardRepo.rows.push(
      { id: 1, list_id: 1, title: 'Source A', position: 1 },
      { id: 2, list_id: 1, title: 'Move me', position: 2 },
      { id: 3, list_id: 1, title: 'Source B', position: 3 },
      { id: 4, list_id: 2, title: 'Target A', position: 1 }
    )
    const dataSource = {
      getRepository(entity: unknown) {
        if (entity === Board) return boardRepo
        if (entity === List) return listRepo
        if (entity === Card) return cardRepo
        if (entity === Comment) return createRepo<any>()
        return createRepo<any>()
      },
    } as any
    const app = createApp(dataSource)

    await request(app).post('/api/cards/2/move').send({ list_id: 2, position: 2 }).expect(200)

    expect(cardRepo.rows).toEqual([
      { id: 1, list_id: 1, title: 'Source A', position: 1 },
      { id: 2, list_id: 2, title: 'Move me', position: 2 },
      { id: 3, list_id: 1, title: 'Source B', position: 2 },
      { id: 4, list_id: 2, title: 'Target A', position: 1 },
    ])
  })

  it('allows cards to clear nullable fields', async () => {
    const boardRepo = createRepo<any>()
    const listRepo = createRepo<any>()
    const cardRepo = createRepo<any>()
    cardRepo.rows.push({
      id: 1,
      list_id: 1,
      title: 'Task',
      description: 'Old description',
      due_date: new Date('2026-06-14T00:00:00.000Z'),
      position: 1,
    })
    const dataSource = {
      getRepository(entity: unknown) {
        if (entity === Board) return boardRepo
        if (entity === List) return listRepo
        if (entity === Card) return cardRepo
        if (entity === Comment) return createRepo<any>()
        return createRepo<any>()
      },
    } as any
    const app = createApp(dataSource)

    await request(app).patch('/api/cards/1').send({ description: null, due_date: null }).expect(200)

    expect(cardRepo.rows[0]).toMatchObject({ description: null, due_date: null })
  })
})
