import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { CardLabel } from './CardLabel'

@Entity('labels')
export class Label {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  name!: string

  @Column()
  color!: string

  @OneToMany(() => CardLabel, (cardLabel) => cardLabel.label)
  cardLabels!: CardLabel[]
}
