import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne, PrimaryColumn,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity({ name: 'donations' })
export class DonationEntity {
  // @PrimaryGeneratedColumn()
  @PrimaryColumn({ nullable: false })
  id: number;

  @Column('numeric', { nullable: false })
  amount: number;

  @Column('date', { nullable: false })
  date: Date;

  @Column('int', { nullable: false })
  employee_id: number;
}
