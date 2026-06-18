import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

function getDbPath(): string {
  if (process.env.DB_PATH) return process.env.DB_PATH

  const appName = 'TaskFlow'
  let baseDir: string

  if (process.platform === 'win32') {
    baseDir = join(process.env.APPDATA || '', appName)
  } else if (process.platform === 'darwin') {
    baseDir = join(process.env.HOME || '', 'Library', 'Application Support', appName)
  } else {
    baseDir = join(process.env.HOME || '', `.${appName.toLowerCase()}`)
  }

  if (!existsSync(baseDir)) {
    mkdirSync(baseDir, { recursive: true })
  }

  return join(baseDir, 'data.db')
}

export const config = {
  apiPort: Number(process.env.API_PORT) || 3001,
  dbPath: getDbPath(),
}
