import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { Board } from './entities/Board'
import { List } from './entities/List'
import { Card } from './entities/Card'
import { TimeBlock } from './entities/TimeBlock'
import { CalendarEvent } from './entities/CalendarEvent'
import { ActivityLog } from './entities/ActivityLog'
import { Comment } from './entities/Comment'
import { InitialSchema1710000000000 } from './migrations/InitialSchema'
import { AddCommentsTable1710000000001 } from './migrations/AddCommentsTable'

const isBrowser = typeof window !== 'undefined'

let _dataSource: DataSource | null = null

function createBrowserStubDataSource() {
  const stubRepo: any = {
    find: async () => [],
    findOne: async () => null,
    save: async (e: any) => e,
    create: (d: any) => d,
    delete: async () => undefined,
    update: async () => undefined,
    count: async () => 0,
  }
  return {
    isInitialized: true,
    getRepository: () => stubRepo,
    initialize: async () => undefined,
    runMigrations: async () => undefined,
  }
}

export const AppDataSource: any = isBrowser
  ? createBrowserStubDataSource()
  : new Proxy({} as DataSource, {
      get(_target, prop) {
        if (_dataSource) return (_dataSource as any)[prop]
        if (prop === 'getRepository') {
          return () => {
            throw new Error('Database not initialized. Call initializeDatabase() first.')
          }
        }
        if (prop === 'isInitialized') return false
        return undefined
      },
    })

export function getDataSource(): DataSource {
  if (_dataSource) return _dataSource

  if (isBrowser) {
    throw new Error(
      'Database cannot be accessed from browser. Use IPC to communicate with main process.'
    )
  }

  const env = typeof process !== 'undefined' ? process.env : {}
  const dbPath = env.DB_PATH || './data.db'

  _dataSource = new DataSource({
    type: 'sqljs',
    database: dbPath,
    synchronize: false,
    logging: false,
    entities: [Board, List, Card, TimeBlock, CalendarEvent, ActivityLog, Comment],
    migrations: [InitialSchema1710000000000, AddCommentsTable1710000000001],
    subscribers: [],
  })

  return _dataSource
}

export async function initializeDatabase() {
  const dataSource = getDataSource()
  try {
    await dataSource.initialize()
    console.log('Database connection established')
    await dataSource.runMigrations()
    console.log('Migrations executed successfully')
  } catch (error) {
    console.error('Database connection failed:', error)
    throw error
  }
}

export { Board, List, Card, TimeBlock, CalendarEvent, ActivityLog, Comment }
