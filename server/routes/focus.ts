import { Router } from 'express'
import type { DataSource } from 'typeorm'
import { Board } from '../../src/database/entities/Board'
import { Card } from '../../src/database/entities/Card'
import {
  DailyFocusOverride,
  type FocusMode,
} from '../../src/database/entities/DailyFocusOverride'
import { List } from '../../src/database/entities/List'
import { deriveFocusItems, isValidLocalDate, type FocusResponse } from '../focus'

const focusModes = new Set<FocusMode>(['include', 'exclude'])

export function createFocusRouter(dataSource: DataSource) {
  const router = Router()
  const boardRepo = dataSource.getRepository(Board)
  const listRepo = dataSource.getRepository(List)
  const cardRepo = dataSource.getRepository(Card)
  const overrideRepo = dataSource.getRepository(DailyFocusOverride)

  router.get('/boards/:boardId/focus', async (req, res, next) => {
    try {
      const date = String(req.query.date ?? '')
      if (!isValidLocalDate(date)) return res.status(400).json({ error: 'Invalid focus date' })

      const boardId = Number(req.params.boardId)
      const board = (await boardRepo.find({ where: { id: boardId } }))[0]
      if (!board) return res.status(404).json({ error: 'Board not found' })

      const lists = await listRepo.find({ where: { board_id: boardId }, order: { position: 'ASC' } })
      const listIds = new Set(lists.map((list) => list.id))
      const cards = (await cardRepo.find()).filter((card) => listIds.has(card.list_id))
      const cardIds = new Set(cards.map((card) => card.id))
      const overrides = (await overrideRepo.find({ where: { focus_date: date } })).filter(
        (override) => cardIds.has(override.card_id)
      )
      const items = deriveFocusItems(cards, lists, overrides, date)
      const response: FocusResponse = {
        date,
        items,
        total: items.length,
        overdueCount: items.filter((item) => item.overdue).length,
      }
      res.json(response)
    } catch (error) {
      next(error)
    }
  })

  router.put('/cards/:cardId/focus', async (req, res, next) => {
    try {
      const cardId = Number(req.params.cardId)
      const date = String(req.body.date ?? '')
      const mode = String(req.body.mode ?? '') as FocusMode
      if (!isValidLocalDate(date)) return res.status(400).json({ error: 'Invalid focus date' })
      if (!focusModes.has(mode)) return res.status(400).json({ error: 'Invalid focus mode' })

      const card = (await cardRepo.find({ where: { id: cardId } }))[0]
      if (!card) return res.status(404).json({ error: 'Card not found' })

      const existing = (
        await overrideRepo.find({ where: { card_id: cardId, focus_date: date } })
      )[0]
      const override = overrideRepo.create({
        ...existing,
        card_id: cardId,
        focus_date: date,
        mode,
      })
      const saved = await overrideRepo.save(override)
      res.json({ cardId, date, mode: saved.mode, focused: saved.mode === 'include' })
    } catch (error) {
      next(error)
    }
  })

  return router
}
