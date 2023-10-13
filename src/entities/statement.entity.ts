import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne, PrimaryColumn,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity({ name: 'statements' })
export class StatementEntity {
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
