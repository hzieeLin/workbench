import { MigrationInterface, QueryRunner } from 'typeorm'

export class InitialSchema1710000000000 implements MigrationInterface {
  name = 'InitialSchema1710000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE boards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    await queryRunner.query(`
      CREATE TABLE lists (
        id INT AUTO_INCREMENT PRIMARY KEY,
        board_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        position INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (board_id) REFERENCES boards(id)
      )
    `)

    await queryRunner.query(`
      CREATE TABLE cards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        list_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description VARCHAR(255),
        priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
        due_date DATETIME,
        position INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (list_id) REFERENCES lists(id)
      )
    `)

    await queryRunner.query(`
      CREATE TABLE labels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        color VARCHAR(255) NOT NULL
      )
    `)

    await queryRunner.query(`
      CREATE TABLE card_labels (
        id INT AUTO_INCREMENT PRIMARY KEY,
        card_id INT NOT NULL,
        label_id INT NOT NULL,
        FOREIGN KEY (card_id) REFERENCES cards(id),
        FOREIGN KEY (label_id) REFERENCES labels(id)
      )
    `)

    await queryRunner.query(`
      CREATE TABLE time_blocks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        card_id INT,
        start_time DATETIME NOT NULL,
        end_time DATETIME NOT NULL,
        title VARCHAR(255) NOT NULL,
        FOREIGN KEY (card_id) REFERENCES cards(id)
      )
    `)

    await queryRunner.query(`
      CREATE TABLE calendar_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        start_time DATETIME NOT NULL,
        end_time DATETIME NOT NULL,
        description VARCHAR(255)
      )
    `)

    await queryRunner.query(`
      CREATE TABLE activity_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        card_id INT NOT NULL,
        action ENUM('created', 'updated', 'completed', 'deleted') NOT NULL,
        timestamp DATETIME NOT NULL
      )
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE activity_logs')
    await queryRunner.query('DROP TABLE calendar_events')
    await queryRunner.query('DROP TABLE time_blocks')
    await queryRunner.query('DROP TABLE card_labels')
    await queryRunner.query('DROP TABLE labels')
    await queryRunner.query('DROP TABLE cards')
    await queryRunner.query('DROP TABLE lists')
    await queryRunner.query('DROP TABLE boards')
  }
}
