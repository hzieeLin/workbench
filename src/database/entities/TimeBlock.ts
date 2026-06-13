import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'

@Entity('time_blocks')
export class TimeBlock {
  @PrimaryGeneratedColumn()
  id!: number

  @Column({ nullable: true })
  card_id?: number

  @Column({ type: 'datetime' })
  start_time!: Date

  @Column({ type: 'datetime' })
  end_time!: Date

  @Column()
  title!: string

  @ManyToOne('Card', (card: any) => card.timeBlocks, { nullable: true })
  @JoinColumn({ name: 'card_id' })
  card?: any
}
