import { Router } from 'express'
import type { DataSource } from 'typeorm'
import { Board } from '../../src/database/entities/Board'

export function createBoardRouter(dataSource: DataSource) {
  const router = Router()
  const repo = dataSource.getRepository(Board)

  router.get('/', async (_req, res, next) => {
    try {
      res.json(await repo.find({ order: { created_at: 'DESC' } }))
    } catch (error) {
      next(error)
    }
  })

  router.post('/', async (req, res, next) => {
    try {
      const name = String(req.body.name ?? '').trim()
      if (!name) return res.status(400).json({ error: 'Board name is required' })

      const board = repo.create({ name, description: req.body.description })
      res.status(201).json(await repo.save(board))
    } catch (error) {
      next(error)
    }
  })

  router.patch('/:id', async (req, res, next) => {
    try {
      await repo.update(Number(req.params.id), req.body)
      res.json({ ok: true })
    } catch (error) {
      next(error)
    }
  })

  router.delete('/:id', async (req, res, next) => {
    try {
      await repo.delete(Number(req.params.id))
      res.json({ ok: true })
    } catch (error) {
      next(error)
    }
  })

  return router
}
