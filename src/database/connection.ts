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

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'task_orchestrator',
  synchronize: true,
  logging: false,
  entities: [Board, List, Card, Label, CardLabel, TimeBlock, CalendarEvent, ActivityLog],
  migrations: [],
  subscribers: [],
})

export async function initializeDatabase() {
  try {
    await AppDataSource.initialize()
    console.log('Database connection established')
  } catch (error) {
    console.error('Database connection failed:', error)
    throw error
  }
}
