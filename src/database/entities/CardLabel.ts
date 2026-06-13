import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'

@Entity('card_labels')
export class CardLabel {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  card_id!: number

  @Column()
  label_id!: number

  @ManyToOne('Card', (card: any) => card.cardLabels)
  @JoinColumn({ name: 'card_id' })
  card!: any

  @ManyToOne('Label', (label: any) => label.cardLabels)
  @JoinColumn({ name: 'label_id' })
  label!: any
}
