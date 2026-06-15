import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { ActivityLog } from '../src/database/entities/ActivityLog'
import { Board } from '../src/database/entities/Board'
import { CalendarEvent } from '../src/database/entities/CalendarEvent'
import { Card } from '../src/database/entities/Card'
import { CardLabel } from '../src/database/entities/CardLabel'
import { Comment } from '../src/database/entities/Comment'
import { Label } from '../src/database/entities/Label'
import { List } from '../src/database/entities/List'
import { TimeBlock } from '../src/database/entities/TimeBlock'
import { InitialSchema1710000000000 } from '../src/database/migrations/InitialSchema'
import { AddCommentsTable1710000000001 } from '../src/database/migrations/AddCommentsTable'
import { AddLabelBoardId1710000000002 } from '../src/database/migrations/AddLabelBoardId'
import { config } from './config'

export function createDataSource() {
  return new DataSource({
    type: 'mysql',
    host: config.db.host,
    port: config.db.port,
    username: config.db.username,
    password: config.db.password,
    database: config.db.database,
    synchronize: false,
    logging: false,
    entities: [Board, List, Card, Label, CardLabel, TimeBlock, CalendarEvent, ActivityLog, Comment],
    migrations: [
      InitialSchema1710000000000,
      AddCommentsTable1710000000001,
      AddLabelBoardId1710000000002,
    ],
  })
}
