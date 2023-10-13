import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne, PrimaryColumn,
  PrimaryGeneratedColumn
} from "typeorm";

@Entity({ name: 'departments' })
export class DepartmentEntity {
  // @PrimaryGeneratedColumn()
  @PrimaryColumn({ nullable: false })
  id: number;

  @Column('text', { nullable: false })
  name: string;
}
