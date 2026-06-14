import { Router } from 'express'
import type { DataSource } from 'typeorm'
import { Card } from '../../src/database/entities/Card'

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
      await repo.update(Number(req.params.id), req.body)
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
      await repo.update(Number(req.params.id), {
        list_id: Number(req.body.list_id),
        position: Number(req.body.position),
      })
      res.json({ ok: true })
    } catch (error) {
      next(error)
    }
  })

  return router
}
