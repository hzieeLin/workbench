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

  @ManyToOne('List', (list: any) => list.cards)
  @JoinColumn({ name: 'list_id' })
  list!: any

  @OneToMany('CardLabel', (cardLabel: any) => cardLabel.card)
  cardLabels!: any[]

  @OneToMany('TimeBlock', (timeBlock: any) => timeBlock.card)
  timeBlocks!: any[]

  @OneToMany('Comment', (comment: any) => comment.card)
  comments!: any[]
}
