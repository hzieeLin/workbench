import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { Board } from './entities/Board'
import { List } from './entities/List'
import { Card } from './entities/Card'
import { Label } from './entities/Label'
import { CardLabel } from './entities/CardLabel'
import { TimeBlock } from './entities/TimeBlock'
import { CalendarEvent } from './entities/CalendarEvent'
import { ActivityLog } from './entities/ActivityLog'
import { InitialSchema1710000000000 } from './migrations/InitialSchema'

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_DATABASE ?? 'task_orchestrator',
  synchronize: false,
  logging: false,
  entities: [Board, List, Card, Label, CardLabel, TimeBlock, CalendarEvent, ActivityLog],
  migrations: [InitialSchema1710000000000],
  subscribers: [],
})

export async function initializeDatabase() {
  try {
    await AppDataSource.initialize()
    console.log('Database connection established')
    await AppDataSource.runMigrations()
    console.log('Migrations executed successfully')
  } catch (error) {
    console.error('Database connection failed:', error)
    throw error
  }
}
