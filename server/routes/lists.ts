import { Router } from 'express'
import type { DataSource } from 'typeorm'
import { Card } from '../../src/database/entities/Card'
import { List } from '../../src/database/entities/List'

export function createListRouter(dataSource: DataSource) {
  const router = Router()
  const repo = dataSource.getRepository(List)
  const cardRepo = dataSource.getRepository(Card)

  router.get('/boards/:boardId/lists', async (req, res, next) => {
    try {
      res.json(
        await repo.find({
          where: { board_id: Number(req.params.boardId) },
          order: { position: 'ASC' },
        })
      )
    } catch (error) {
      next(error)
    }
  })

  router.post('/boards/:boardId/lists', async (req, res, next) => {
    try {
      const name = String(req.body.name ?? '').trim()
      if (!name) return res.status(400).json({ error: 'List name is required' })

      const boardId = Number(req.params.boardId)
      const existing = await repo.find({ where: { board_id: boardId } })
      const maxPosition = existing.length ? Math.max(...existing.map((list) => list.position)) : 0
      const list = repo.create({
        board_id: boardId,
        name,
        position: maxPosition + 1,
      })
      res.status(201).json(await repo.save(list))
    } catch (error) {
      next(error)
    }
  })

  router.patch('/lists/:id', async (req, res, next) => {
    try {
      await repo.update(Number(req.params.id), req.body)
      res.json({ ok: true })
    } catch (error) {
      next(error)
    }
  })

  router.delete('/lists/:id', async (req, res, next) => {
    try {
      const listId = Number(req.params.id)
      const cards = await cardRepo.find({ where: { list_id: listId } })
      for (const card of cards) {
        await cardRepo.delete(card.id)
      }
      await repo.delete(listId)
      res.json({ ok: true })
    } catch (error) {
      next(error)
    }
  })

  return router
}
