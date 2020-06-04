import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

@Entity('cats')
export class CatEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string

  @Column({ nullable: true })
  color?: string

  @Column({ type: 'timestamp', update: false, default: () => 'now()' })
  created: Date
}
