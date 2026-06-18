import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'

@Entity('todos')
export class Todo {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  card_id!: number

  @Column()
  text!: string

  @Column({ default: false })
  completed!: boolean

  @Column()
  position!: number

  @CreateDateColumn({ type: 'datetime' })
  created_at!: Date

  @ManyToOne('Card', (card: any) => card.todos)
  @JoinColumn({ name: 'card_id' })
  card!: any
}
