import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm'
import { Board } from './Board'
import { Card } from './Card'

@Entity('lists')
export class List {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  board_id!: number

  @Column()
  name!: string

  @Column()
  position!: number

  @CreateDateColumn()
  created_at!: Date

  @ManyToOne(() => Board, (board) => board.lists)
  board!: Board

  @OneToMany(() => Card, (card) => card.list)
  cards!: Card[]
}
