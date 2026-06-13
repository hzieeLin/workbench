import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'

@Entity('labels')
export class Label {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  name!: string

  @Column()
  color!: string

  @OneToMany('CardLabel', (cardLabel: any) => cardLabel.label)
  cardLabels!: any[]
}
