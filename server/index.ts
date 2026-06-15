import 'reflect-metadata'
import { startApiServer } from './http'

async function main() {
  await startApiServer()
}

main().catch((error) => {
  console.error('Failed to start API server:', error)
  process.exit(1)
})
