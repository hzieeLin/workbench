import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

export type FocusMode = 'include' | 'exclude'

@Entity('daily_focus_overrides')
@Index(['card_id', 'focus_date'], { unique: true })
export class DailyFocusOverride {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  card_id!: number

  @Column({ type: 'date' })
  focus_date!: string

  @Column({ type: 'text' })
  mode!: FocusMode

  @CreateDateColumn({ type: 'datetime' })
  created_at!: Date

  @UpdateDateColumn({ type: 'datetime' })
  updated_at!: Date

  @ManyToOne('Card', (card: any) => card.focusOverrides, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'card_id' })
  card!: any
}
