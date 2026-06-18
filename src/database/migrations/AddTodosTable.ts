import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddTodosTable1710000000002 implements MigrationInterface {
  name = 'AddTodosTable1710000000002'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_id INTEGER NOT NULL,
        text TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        position INTEGER NOT NULL,
        created_at TEXT DEFAULT (datetime('now','localtime')),
        FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
      )
    `)
    await queryRunner.query(`CREATE INDEX idx_todos_card_id ON todos(card_id)`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE todos')
  }
}
