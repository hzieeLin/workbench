import cors from 'cors'
import express, { type ErrorRequestHandler } from 'express'
import type { DataSource } from 'typeorm'
import { createBoardRouter } from './routes/boards'
import { createCardRouter } from './routes/cards'
import { createCommentRouter } from './routes/comments'
import { createListRouter } from './routes/lists'

export function createApp(dataSource?: DataSource) {
  const app = express()

  app.locals.dataSource = dataSource

  app.use(cors())
  app.use(express.json())

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  if (dataSource) {
    app.use('/api/boards', createBoardRouter(dataSource))
    app.use('/api', createListRouter(dataSource))
    app.use('/api', createCardRouter(dataSource))
    app.use('/api', createCommentRouter(dataSource))
  }

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    const message = err instanceof Error ? err.message : 'Internal server error'
    res.status(500).json({ error: message })
  }

  app.use(errorHandler)

  return app
}
