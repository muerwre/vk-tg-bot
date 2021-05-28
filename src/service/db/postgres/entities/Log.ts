import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class Log {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column()
  level!: string;
  @Column({ type: "text" })
  message!: string;
  @Column("simple-json", { default: {}, nullable: false })
  body!: Record<any, any>;
  @CreateDateColumn()
  createdAt!: Date;
  @UpdateDateColumn()
  updatedAt!: Date;
}
