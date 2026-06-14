import { createApp } from './app'
import { config } from './config'
import { createDataSource } from './data-source'

async function main() {
  const dataSource = createDataSource()
  await dataSource.initialize()
  await dataSource.runMigrations()

  const app = createApp(dataSource)
  app.listen(config.apiPort, () => {
    console.log(`API listening on http://localhost:${config.apiPort}`)
  })
}

main().catch((error) => {
  console.error('Failed to start API server:', error)
  process.exit(1)
})
