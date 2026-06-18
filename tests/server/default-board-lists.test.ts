/**
 * @jest-environment node
 */

import request from 'supertest'
import { createApp } from '../../server/app'
import { Board } from '../../src/database/entities/Board'
import { List } from '../../src/database/entities/List'

function createRepo<T extends { id?: number }>() {
  let nextId = 1
  const rows: T[] = []

  return {
    rows,
    create: jest.fn((data: Partial<T>) => data as T),
    save: jest.fn(async (input: T | T[]) => {
      if (Array.isArray(input)) {
        const saved = input.map((entity) => ({ ...entity, id: entity.id ?? nextId++ }) as T)
        rows.push(...saved)
        return saved
      }
      const saved = { ...input, id: input.id ?? nextId++ } as T
      rows.push(saved)
      return saved
    }),
    find: jest.fn(async () => [...rows]),
    update: jest.fn(),
    delete: jest.fn(),
  }
}

function createDataSource() {
  const boardRepo = createRepo<any>()
  const listRepo = createRepo<any>()
  const fallbackRepo = createRepo<any>()
  const getRepository = jest.fn((entity: unknown) => {
    if (entity === Board) return boardRepo
    if (entity === List) return listRepo
    return fallbackRepo
  })

  const dataSource = {
    getRepository,
    transaction: jest.fn(async (work: (manager: { getRepository: typeof getRepository }) => any) => {
      const boardSnapshot = [...boardRepo.rows]
      const listSnapshot = [...listRepo.rows]
      try {
        return await work({ getRepository })
      } catch (error) {
        boardRepo.rows.splice(0, boardRepo.rows.length, ...boardSnapshot)
        listRepo.rows.splice(0, listRepo.rows.length, ...listSnapshot)
        throw error
      }
    }),
  }

  return { dataSource: dataSource as any, boardRepo, listRepo }
}

describe('default board lists', () => {
  it('creates a board and its three default lists in one transaction', async () => {
    const { dataSource, boardRepo, listRepo } = createDataSource()

    const response = await request(createApp(dataSource))
      .post('/api/boards')
      .send({ name: '产品发布' })
      .expect(201)

    expect(dataSource.transaction).toHaveBeenCalledTimes(1)
    expect(boardRepo.rows).toHaveLength(1)
    expect(listRepo.rows).toEqual([
      expect.objectContaining({ board_id: response.body.id, name: '待开始', position: 1 }),
      expect.objectContaining({ board_id: response.body.id, name: '进行中', position: 2 }),
      expect.objectContaining({ board_id: response.body.id, name: '已完成', position: 3 }),
    ])
  })

  it('rolls back the board when a default list cannot be saved', async () => {
    const { dataSource, boardRepo, listRepo } = createDataSource()
    listRepo.save.mockRejectedValueOnce(new Error('list write failed'))

    await request(createApp(dataSource))
      .post('/api/boards')
      .send({ name: '无法创建的看板' })
      .expect(500)

    expect(boardRepo.rows).toEqual([])
    expect(listRepo.rows).toEqual([])
  })
})
