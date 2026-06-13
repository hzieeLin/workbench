import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('calendar_events')
export class CalendarEvent {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  title!: string

  @Column({ type: 'datetime' })
  start_time!: Date

  @Column({ type: 'datetime' })
  end_time!: Date

  @Column({ nullable: true })
  description?: string
}
