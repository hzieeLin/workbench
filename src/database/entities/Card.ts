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

  @Column({ type: 'text', default: 'medium' })
  priority!: 'low' | 'medium' | 'high'

  @Column({ type: 'datetime', nullable: true })
  due_date?: Date

  @Column()
  position!: number

  @CreateDateColumn({ type: 'datetime' })
  created_at!: Date

  @UpdateDateColumn({ type: 'datetime' })
  updated_at!: Date

  @ManyToOne('List', (list: any) => list.cards)
  @JoinColumn({ name: 'list_id' })
  list!: any

  @OneToMany('TimeBlock', (timeBlock: any) => timeBlock.card)
  timeBlocks!: any[]

  @OneToMany('Comment', (comment: any) => comment.card)
  comments!: any[]

  @OneToMany('Todo', (todo: any) => todo.card)
  todos!: any[]
}
