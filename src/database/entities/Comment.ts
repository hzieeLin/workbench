import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm'

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  card_id!: number

  @Column()
  author!: string

  @Column({ type: 'text' })
  content!: string

  @CreateDateColumn({ type: 'datetime' })
  created_at!: Date

  @ManyToOne('Card', (card: any) => card.comments)
  @JoinColumn({ name: 'card_id' })
  card!: any
}
