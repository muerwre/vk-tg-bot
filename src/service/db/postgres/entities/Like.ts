import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class Like {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column()
  messageId!: number;
  @Column()
  channel!: string;
  @Column({ type: "text" })
  text!: string;
  @Column()
  author!: number;
  @CreateDateColumn()
  createdAt!: Date;
  @UpdateDateColumn()
  updatedAt!: Date;
}
