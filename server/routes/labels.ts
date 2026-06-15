import { Router } from 'express'
import type { DataSource } from 'typeorm'
import { Label } from '../../src/database/entities/Label'

export function createLabelRouter(dataSource: DataSource) {
  const router = Router()
  const repo = dataSource.getRepository(Label)

  router.get('/boards/:boardId/labels', async (req, res, next) => {
    try {
      res.json(
        await repo.find({
          where: { board_id: Number(req.params.boardId) },
          order: { id: 'ASC' },
        })
      )
    } catch (error) {
      next(error)
    }
  })

  router.post('/boards/:boardId/labels', async (req, res, next) => {
    try {
      const name = String(req.body.name ?? '').trim()
      if (!name) return res.status(400).json({ error: 'Label name is required' })

      const color = String(req.body.color ?? '').trim()
      if (!color) return res.status(400).json({ error: 'Label color is required' })

      const label = repo.create({
        board_id: Number(req.params.boardId),
        name,
        color,
      })
      res.status(201).json(await repo.save(label))
    } catch (error) {
      next(error)
    }
  })

  router.patch('/labels/:id', async (req, res, next) => {
    try {
      const data: Record<string, unknown> = {}
      if (req.body.name !== undefined) data.name = req.body.name
      if (req.body.color !== undefined) data.color = req.body.color

      await repo.update(Number(req.params.id), data)
      res.json({ ok: true })
    } catch (error) {
      next(error)
    }
  })

  router.delete('/labels/:id', async (req, res, next) => {
    try {
      await repo.delete(Number(req.params.id))
      res.json({ ok: true })
    } catch (error) {
      next(error)
    }
  })

  return router
}
