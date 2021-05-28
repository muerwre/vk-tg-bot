import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class Request {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column("simple-json", { default: {}, nullable: false })
  body!: Record<any, any>;
  @CreateDateColumn()
  createdAt!: Date;
  @UpdateDateColumn()
  updatedAt!: Date;
}
