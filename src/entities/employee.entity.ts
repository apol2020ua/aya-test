import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne, PrimaryColumn,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity({ name: 'employees' })
export class EmployeeEntity {
  @PrimaryColumn({ nullable: false })
  id: number;

  @Column('text', { nullable: false })
  name: string;

  @Column('text', { nullable: false })
  surname: string;

  @Column('int', { nullable: false })
  department_id: number;
}
