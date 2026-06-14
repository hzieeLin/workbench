import type { Server } from 'http'
import { createApp } from './app'
import { config } from './config'
import { createDataSource } from './data-source'

export async function startApiServer(): Promise<Server> {
  const dataSource = createDataSource()
  await dataSource.initialize()
  await dataSource.runMigrations()

  const app = createApp(dataSource)
  const server = app.listen(config.apiPort, () => {
    console.log(`API listening on http://localhost:${config.apiPort}`)
  })

  server.on('close', () => {
    if (dataSource.isInitialized) {
      void dataSource.destroy()
    }
  })

  return server
}
