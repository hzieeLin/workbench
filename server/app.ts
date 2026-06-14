import cors from 'cors'
import express, { type ErrorRequestHandler } from 'express'
import type { DataSource } from 'typeorm'

export function createApp(dataSource?: DataSource) {
  const app = express()

  app.locals.dataSource = dataSource

  app.use(cors())
  app.use(express.json())

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    const message = err instanceof Error ? err.message : 'Internal server error'
    res.status(500).json({ error: message })
  }

  app.use(errorHandler)

  return app
}
