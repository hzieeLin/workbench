import { Router } from 'express'
import type { DataSource } from 'typeorm'
import { In } from 'typeorm'
import { Label } from '../../src/database/entities/Label'
import { CardLabel } from '../../src/database/entities/CardLabel'
import { Card } from '../../src/database/entities/Card'
import { List } from '../../src/database/entities/List'

export function createLabelRouter(dataSource: DataSource) {
  const router = Router()
  const repo = dataSource.getRepository(Label)
  const cardLabelRepo = dataSource.getRepository(CardLabel)
  const cardRepo = dataSource.getRepository(Card)
  const listRepo = dataSource.getRepository(List)

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

  router.get('/boards/:boardId/card-labels', async (req, res, next) => {
    try {
      const boardId = Number(req.params.boardId)
      const lists = await listRepo.find({ where: { board_id: boardId } })
      const listIds = lists.map((l) => l.id)
      if (listIds.length === 0) return res.json({})

      const cards = await cardRepo.find({ where: { list_id: In(listIds) } })
      const cardIds = cards.map((c) => c.id)
      if (cardIds.length === 0) return res.json({})

      const cardLabels = await cardLabelRepo
        .createQueryBuilder('cl')
        .innerJoinAndSelect('cl.label', 'label')
        .where('cl.card_id IN (:...cardIds)', { cardIds })
        .getMany()

      const result: Record<number, Label[]> = {}
      for (const cl of cardLabels) {
        if (!result[cl.card_id]) result[cl.card_id] = []
        result[cl.card_id].push(cl.label)
      }
      res.json(result)
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
