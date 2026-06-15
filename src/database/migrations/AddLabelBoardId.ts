import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddLabelBoardId1710000000002 implements MigrationInterface {
  name = 'AddLabelBoardId1710000000002'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE labels ADD COLUMN board_id INT NOT NULL DEFAULT 0`)
    await queryRunner.query(`CREATE INDEX idx_labels_board_id ON labels(board_id)`)
    await queryRunner.query(`ALTER TABLE labels ADD FOREIGN KEY (board_id) REFERENCES boards(id)`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE labels DROP FOREIGN KEY labels_ibfk_1`)
    await queryRunner.query(`DROP INDEX idx_labels_board_id ON labels`)
    await queryRunner.query(`ALTER TABLE labels DROP COLUMN board_id`)
  }
}
