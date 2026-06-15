import { Router } from 'express'
import type { DataSource } from 'typeorm'
import { Comment } from '../../src/database/entities/Comment'

export function createCommentRouter(dataSource: DataSource) {
  const router = Router()
  const repo = dataSource.getRepository(Comment)

  router.get('/cards/:cardId/comments', async (req, res, next) => {
    try {
      res.json(
        await repo.find({
          where: { card_id: Number(req.params.cardId) },
          order: { created_at: 'ASC' },
        })
      )
    } catch (error) {
      next(error)
    }
  })

  router.post('/cards/:cardId/comments', async (req, res, next) => {
    try {
      const content = String(req.body.content ?? '').trim()
      if (!content) return res.status(400).json({ error: 'Comment content is required' })

      const comment = repo.create({
        card_id: Number(req.params.cardId),
        author: req.body.author || '用户',
        content,
      })
      res.status(201).json(await repo.save(comment))
    } catch (error) {
      next(error)
    }
  })

  router.delete('/comments/:id', async (req, res, next) => {
    try {
      await repo.delete(Number(req.params.id))
      res.json({ ok: true })
    } catch (error) {
      next(error)
    }
  })

  return router
}
