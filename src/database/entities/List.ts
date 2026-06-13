import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm'

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

  @ManyToOne('Board', (board: any) => board.lists)
  @JoinColumn({ name: 'board_id' })
  board!: any

  @OneToMany('Card', (card: any) => card.list)
  cards!: any[]
}
