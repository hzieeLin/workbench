import { MigrationInterface, QueryRunner } from 'typeorm'

export class InitialSchema1710000000000 implements MigrationInterface {
  name = 'InitialSchema1710000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`PRAGMA foreign_keys = ON`)

    await queryRunner.query(`
      CREATE TABLE boards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT DEFAULT NULL,
        created_at TEXT DEFAULT (datetime('now','localtime')),
        updated_at TEXT DEFAULT NULL
      )
    `)

    await queryRunner.query(`
      CREATE TABLE lists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        board_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        position INTEGER NOT NULL,
        created_at TEXT DEFAULT (datetime('now','localtime')),
        FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
      )
    `)
    await queryRunner.query(`CREATE INDEX idx_lists_board_id ON lists(board_id)`)

    await queryRunner.query(`
      CREATE TABLE cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        list_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT DEFAULT NULL,
        priority TEXT DEFAULT 'medium',
        due_date TEXT DEFAULT NULL,
        position INTEGER NOT NULL,
        created_at TEXT DEFAULT (datetime('now','localtime')),
        updated_at TEXT DEFAULT NULL,
        FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE
      )
    `)
    await queryRunner.query(`CREATE INDEX idx_cards_list_id ON cards(list_id)`)

    await queryRunner.query(`
      CREATE TABLE time_blocks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_id INTEGER,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        title TEXT NOT NULL,
        FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
      )
    `)
    await queryRunner.query(`CREATE INDEX idx_time_blocks_card_id ON time_blocks(card_id)`)

    await queryRunner.query(`
      CREATE TABLE calendar_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        description TEXT DEFAULT NULL
      )
    `)

    await queryRunner.query(`
      CREATE TABLE activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_id INTEGER NOT NULL,
        action TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
      )
    `)
    await queryRunner.query(`CREATE INDEX idx_activity_logs_card_id ON activity_logs(card_id)`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE activity_logs')
    await queryRunner.query('DROP TABLE calendar_events')
    await queryRunner.query('DROP TABLE time_blocks')
    await queryRunner.query('DROP TABLE cards')
    await queryRunner.query('DROP TABLE lists')
    await queryRunner.query('DROP TABLE boards')
  }
}
