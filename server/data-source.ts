import 'reflect-metadata'
import { readFileSync, existsSync } from 'fs'
import { DataSource } from 'typeorm'
import { Board } from '../src/database/entities/Board'
import { Card } from '../src/database/entities/Card'
import { Comment } from '../src/database/entities/Comment'
import { List } from '../src/database/entities/List'
import { Todo } from '../src/database/entities/Todo'
import { DailyFocusOverride } from '../src/database/entities/DailyFocusOverride'
import { InitialSchema1710000000000 } from '../src/database/migrations/InitialSchema'
import { AddCommentsTable1710000000001 } from '../src/database/migrations/AddCommentsTable'
import { AddTodosTable1710000000002 } from '../src/database/migrations/AddTodosTable'
import { AddDailyFocusOverridesTable1710000000003 } from '../src/database/migrations/AddDailyFocusOverridesTable'
import { config } from './config'

export function createDataSource() {
  let dbData: Buffer | undefined
  if (existsSync(config.dbPath)) {
    dbData = readFileSync(config.dbPath)
  }

  return new DataSource({
    type: 'sqljs',
    database: dbData,
    synchronize: false,
    logging: false,
    entities: [
      Board,
      List,
      Card,
      Comment,
      Todo,
      DailyFocusOverride,
    ],
    migrations: [
      InitialSchema1710000000000,
      AddCommentsTable1710000000001,
      AddTodosTable1710000000002,
      AddDailyFocusOverridesTable1710000000003,
    ],
  })
}
