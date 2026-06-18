import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddDailyFocusOverridesTable1710000000003 implements MigrationInterface {
  name = 'AddDailyFocusOverridesTable1710000000003'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE daily_focus_overrides (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        card_id INTEGER NOT NULL,
        focus_date TEXT NOT NULL,
        mode TEXT NOT NULL CHECK (mode IN ('include', 'exclude')),
        created_at TEXT DEFAULT (datetime('now','localtime')),
        updated_at TEXT DEFAULT (datetime('now','localtime')),
        FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
      )
    `)
    await queryRunner.query(
      'CREATE UNIQUE INDEX idx_daily_focus_card_date ON daily_focus_overrides(card_id, focus_date)'
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE daily_focus_overrides')
  }
}
