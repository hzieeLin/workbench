import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { Card } from './Card'
import { Label } from './Label'

@Entity('card_labels')
export class CardLabel {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  card_id!: number

  @Column()
  label_id!: number

  @ManyToOne(() => Card, (card) => card.cardLabels)
  @JoinColumn({ name: 'card_id' })
  card!: Card

  @ManyToOne(() => Label, (label) => label.cardLabels)
  @JoinColumn({ name: 'label_id' })
  label!: Label
}
