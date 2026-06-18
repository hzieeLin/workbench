import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm'

@Entity('boards')
export class Board {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  name!: string

  @Column({ type: 'text', nullable: true })
  description?: string

  @CreateDateColumn({ type: 'datetime' })
  created_at!: Date

  @UpdateDateColumn({ type: 'datetime' })
  updated_at!: Date

  @OneToMany('List', (list: any) => list.board)
  lists!: any[]
}
