/**
 * @jest-environment node
 */

import request from 'supertest'
import { createApp } from '../../server/app'
import { deriveFocusItems, isValidLocalDate } from '../../server/focus'
import { Board } from '../../src/database/entities/Board'
import { Card } from '../../src/database/entities/Card'
import { DailyFocusOverride } from '../../src/database/entities/DailyFocusOverride'
import { List } from '../../src/database/entities/List'

type Row = { id?: number; [key: string]: any }

function createRepo(initial: Row[] = []) {
  let nextId = Math.max(0, ...initial.map((row) => row.id ?? 0)) + 1
  const rows = [...initial]
  return {
    rows,
    find: jest.fn(async (options?: { where?: Record<string, unknown> }) => {
      if (!options?.where) return [...rows]
      return rows.filter((row) =>
        Object.entries(options.where!).every(([key, value]) => row[key] === value)
      )
    }),
    create: jest.fn((data: Row) => data),
    save: jest.fn(async (data: Row | Row[]) => {
      if (Array.isArray(data)) {
        const saved = data.map((row) => ({ ...row, id: row.id ?? nextId++ }))
        rows.push(...saved)
        return saved
      }
      const index = rows.findIndex((row) => row.id === data.id)
      const saved = { ...data, id: data.id ?? nextId++ }
      if (index === -1) rows.push(saved)
      else rows[index] = saved
      return saved
    }),
    update: jest.fn(async (id: number, data: Row) => {
      const index = rows.findIndex((row) => row.id === id)
      if (index !== -1) rows[index] = { ...rows[index], ...data }
    }),
    delete: jest.fn(async (id: number) => {
      const index = rows.findIndex((row) => row.id === id)
      if (index !== -1) rows.splice(index, 1)
    }),
  }
}

function createFocusDataSource() {
  const boardRepo = createRepo([{ id: 1, name: '工作' }])
  const listRepo = createRepo([
    { id: 10, board_id: 1, name: '进行中', position: 1 },
    { id: 11, board_id: 1, name: '  已完成  ', position: 2 },
  ])
  const cardRepo = createRepo([
    { id: 1, list_id: 10, title: '逾期任务', due_date: new Date(2026, 5, 17, 12) },
    { id: 2, list_id: 10, title: '今日任务', due_date: new Date(2026, 5, 18, 12) },
    { id: 3, list_id: 10, title: '未来任务', due_date: new Date(2026, 5, 19, 12) },
    { id: 4, list_id: 10, title: '手动任务' },
    { id: 5, list_id: 11, title: '已完成逾期任务', due_date: new Date(2026, 5, 16, 12) },
  ])
  const overrideRepo = createRepo([
    { id: 1, card_id: 2, focus_date: '2026-06-18', mode: 'exclude' },
    {
      id: 2,
      card_id: 4,
      focus_date: '2026-06-18',
      mode: 'include',
      created_at: new Date(2026, 5, 18, 9),
    },
  ])
  const fallbackRepo = createRepo()
  const getRepository = jest.fn((entity: unknown) => {
    if (entity === Board) return boardRepo
    if (entity === List) return listRepo
    if (entity === Card) return cardRepo
    if (entity === DailyFocusOverride) return overrideRepo
    return fallbackRepo
  })
  const dataSource = {
    getRepository,
    transaction: jest.fn(async (work: (manager: { getRepository: typeof getRepository }) => any) =>
      work({ getRepository })
    ),
  }
  return { dataSource: dataSource as any, boardRepo, listRepo, cardRepo, overrideRepo }
}

describe('focus rules', () => {
  it('validates real local calendar dates', () => {
    expect(isValidLocalDate('2026-06-18')).toBe(true)
    expect(isValidLocalDate('2026-02-30')).toBe(false)
    expect(isValidLocalDate('18-06-2026')).toBe(false)
  })

  it('derives focus using due dates, overrides, and completed list names', () => {
    const { listRepo, cardRepo, overrideRepo } = createFocusDataSource()

    const result = deriveFocusItems(
      cardRepo.rows as any,
      listRepo.rows as any,
      overrideRepo.rows as any,
      '2026-06-18'
    )

    expect(result.map((item) => item.card.id)).toEqual([1, 4])
    expect(result[0]).toMatchObject({ source: 'automatic', overdue: true })
    expect(result[1]).toMatchObject({ source: 'manual', overdue: false })
  })
})

describe('focus API', () => {
  it('returns derived focus items and summary counts', async () => {
    const { dataSource } = createFocusDataSource()

    const response = await request(createApp(dataSource))
      .get('/api/boards/1/focus?date=2026-06-18')
      .expect(200)

    expect(response.body.date).toBe('2026-06-18')
    expect(response.body.items.map((item: any) => item.card.id)).toEqual([1, 4])
    expect(response.body).toMatchObject({ total: 2, overdueCount: 1 })
  })

  it('rejects malformed dates and modes', async () => {
    const { dataSource } = createFocusDataSource()
    const app = createApp(dataSource)

    await request(app).get('/api/boards/1/focus?date=18-06-2026').expect(400)
    await request(app)
      .put('/api/cards/1/focus')
      .send({ date: '2026-06-18', mode: 'later' })
      .expect(400)
  })

  it('upserts a card focus override for the requested day', async () => {
    const { dataSource, overrideRepo } = createFocusDataSource()

    await request(createApp(dataSource))
      .put('/api/cards/3/focus')
      .send({ date: '2026-06-18', mode: 'include' })
      .expect(200)

    expect(overrideRepo.rows).toContainEqual(
      expect.objectContaining({ card_id: 3, focus_date: '2026-06-18', mode: 'include' })
    )
  })

  it('returns 404 for missing boards and cards', async () => {
    const { dataSource } = createFocusDataSource()
    const app = createApp(dataSource)

    await request(app).get('/api/boards/99/focus?date=2026-06-18').expect(404)
    await request(app)
      .put('/api/cards/99/focus')
      .send({ date: '2026-06-18', mode: 'include' })
      .expect(404)
  })
})
