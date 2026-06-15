import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddCommentsTable1710000000001 implements MigrationInterface {
  name = 'AddCommentsTable1710000000001'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        card_id INT NOT NULL,
        author VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (card_id) REFERENCES cards(id)
      )
    `)
    await queryRunner.query(`CREATE INDEX idx_comments_card_id ON comments(card_id)`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE comments')
  }
}