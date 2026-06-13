import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm'
import { List } from './List'
import { CardLabel } from './CardLabel'
import { TimeBlock } from './TimeBlock'

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  list_id!: number

  @Column()
  title!: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @Column({ type: 'enum', enum: ['low', 'medium', 'high'], default: 'medium' })
  priority!: 'low' | 'medium' | 'high'

  @Column({ type: 'datetime', nullable: true })
  due_date?: Date

  @Column()
  position!: number

  @CreateDateColumn()
  created_at!: Date

  @UpdateDateColumn()
  updated_at!: Date

  @ManyToOne(() => List, (list) => list.cards)
  @JoinColumn({ name: 'list_id' })
  list!: List

  @OneToMany(() => CardLabel, (cardLabel) => cardLabel.card)
  cardLabels!: CardLabel[]

  @OneToMany(() => TimeBlock, (timeBlock) => timeBlock.card)
  timeBlocks!: TimeBlock[]
}
