import { Router } from 'express'
import type { DataSource } from 'typeorm'
import { Todo } from '../../src/database/entities/Todo'

export function createTodoRouter(dataSource: DataSource) {
  const router = Router()
  const repo = dataSource.getRepository(Todo)

  router.get('/cards/:cardId/todos', async (req, res, next) => {
    try {
      const todos = await repo.find({
        where: { card_id: Number(req.params.cardId) },
        order: { position: 'ASC' },
      })
      res.json(todos)
    } catch (error) {
      next(error)
    }
  })

  router.post('/cards/:cardId/todos', async (req, res, next) => {
    try {
      const text = String(req.body.text ?? '').trim()
      if (!text) return res.status(400).json({ error: 'Todo text is required' })

      const cardId = Number(req.params.cardId)
      const existing = await repo.find({ where: { card_id: cardId } })
      const maxPosition = existing.length ? Math.max(...existing.map((todo) => todo.position)) : 0
      const todo = repo.create({
        card_id: cardId,
        text,
        completed: false,
        position: maxPosition + 1,
      })
      res.status(201).json(await repo.save(todo))
    } catch (error) {
      next(error)
    }
  })

  router.patch('/todos/:id', async (req, res, next) => {
    try {
      const data = {
        text: req.body.text,
        completed: req.body.completed,
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

  router.delete('/todos/:id', async (req, res, next) => {
    try {
      await repo.delete(Number(req.params.id))
      res.json({ ok: true })
    } catch (error) {
      next(error)
    }
  })

  return router
}
