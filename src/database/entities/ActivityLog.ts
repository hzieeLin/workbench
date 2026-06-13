import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  card_id!: number

  @Column({ type: 'enum', enum: ['created', 'updated', 'completed', 'deleted'] })
  action!: 'created' | 'updated' | 'completed' | 'deleted'

  @Column({ type: 'datetime' })
  timestamp!: Date
}
