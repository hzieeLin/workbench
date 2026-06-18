import { Router } from 'express'
import type { DataSource } from 'typeorm'
import { Board } from '../../src/database/entities/Board'
import { Card } from '../../src/database/entities/Card'
import { List } from '../../src/database/entities/List'

export function createBoardRouter(dataSource: DataSource) {
  const router = Router()
  const repo = dataSource.getRepository(Board)
  const listRepo = dataSource.getRepository(List)
  const cardRepo = dataSource.getRepository(Card)

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

      const board = await dataSource.transaction(async (manager) => {
        const boardRepository = manager.getRepository(Board)
        const listRepository = manager.getRepository(List)
        const savedBoard = await boardRepository.save(
          boardRepository.create({ name, description: req.body.description })
        )
        const defaultLists = [
          { name: '待开始', position: 1 },
          { name: '进行中', position: 2 },
          { name: '已完成', position: 3 },
        ].map((list) =>
          listRepository.create({
            board_id: savedBoard.id,
            name: list.name,
            position: list.position,
          })
        )
        await listRepository.save(defaultLists)
        return savedBoard
      })
      res.status(201).json(board)
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
      const boardId = Number(req.params.id)
      const lists = await listRepo.find({ where: { board_id: boardId } })
      for (const list of lists) {
        const cards = await cardRepo.find({ where: { list_id: list.id } })
        for (const card of cards) {
          await cardRepo.delete(card.id)
        }
        await listRepo.delete(list.id)
      }
      await repo.delete(boardId)
      res.json({ ok: true })
    } catch (error) {
      next(error)
    }
  })

  return router
}
