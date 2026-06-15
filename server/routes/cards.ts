import { Router } from 'express'
import type { DataSource } from 'typeorm'
import { Card } from '../../src/database/entities/Card'

const priorities = new Set(['low', 'medium', 'high'])

export function createCardRouter(dataSource: DataSource) {
  const router = Router()
  const repo = dataSource.getRepository(Card)

  router.get('/lists/:listId/cards', async (req, res, next) => {
    try {
      res.json(
        await repo.find({
          where: { list_id: Number(req.params.listId) },
          order: { position: 'ASC' },
        })
      )
    } catch (error) {
      next(error)
    }
  })

  router.post('/lists/:listId/cards', async (req, res, next) => {
    try {
      const title = String(req.body.title ?? '').trim()
      if (!title) return res.status(400).json({ error: 'Card title is required' })

      const listId = Number(req.params.listId)
      const existing = await repo.find({ where: { list_id: listId } })
      const maxPosition = existing.length ? Math.max(...existing.map((card) => card.position)) : 0
      const card = repo.create({
        list_id: listId,
        title,
        description: req.body.description,
        priority: req.body.priority ?? 'medium',
        due_date: req.body.due_date ? new Date(req.body.due_date) : undefined,
        position: maxPosition + 1,
      })
      res.status(201).json(await repo.save(card))
    } catch (error) {
      next(error)
    }
  })

  router.patch('/cards/:id', async (req, res, next) => {
    try {
      if (req.body.priority !== undefined && !priorities.has(req.body.priority)) {
        return res.status(400).json({ error: 'Invalid card priority' })
      }

      const data = {
        title: req.body.title,
        description: req.body.description,
        priority: req.body.priority,
        due_date: req.body.due_date === null ? null : req.body.due_date,
        position: req.body.position,
      }
      Object.keys(data).forEach((key) => {
        if (data[key as keyof typeof data] === undefined) delete data[key as keyof typeof data]
      })
      await repo.update(Number(req.params.id), data)
      res.json({ ok: true })
    } catch (error) {
      next(error)
    }
  })

  router.delete('/cards/:id', async (req, res, next) => {
    try {
      await repo.delete(Number(req.params.id))
      res.json({ ok: true })
    } catch (error) {
      next(error)
    }
  })

  router.post('/cards/:id/move', async (req, res, next) => {
    try {
      const cardId = Number(req.params.id)
      const targetListId = Number(req.body.list_id)
      const targetPosition = Number(req.body.position)
      if (
        !Number.isFinite(targetListId) ||
        !Number.isFinite(targetPosition) ||
        targetPosition < 1
      ) {
        return res.status(400).json({ error: 'Card move requires list_id and position' })
      }
      const allCards = await repo.find()
      const card = allCards.find((item) => item.id === cardId)
      if (!card) return res.status(404).json({ error: 'Card not found' })

      const oldListId = card.list_id
      const sourceCards = allCards
        .filter((item) => item.list_id === oldListId && item.id !== cardId)
        .sort((a, b) => a.position - b.position)
      const targetCards =
        oldListId === targetListId
          ? sourceCards
          : allCards
              .filter((item) => item.list_id === targetListId)
              .sort((a, b) => a.position - b.position)
      const insertIndex = Math.max(0, Math.min(targetPosition - 1, targetCards.length))
      targetCards.splice(insertIndex, 0, { ...card, list_id: targetListId })

      for (let index = 0; index < sourceCards.length; index += 1) {
        await repo.update(sourceCards[index].id, { position: index + 1 })
      }
      for (let index = 0; index < targetCards.length; index += 1) {
        await repo.update(targetCards[index].id, {
          list_id: targetListId,
          position: index + 1,
        })
      }
      res.json({ ok: true })
    } catch (error) {
      next(error)
    }
  })

  return router
}
