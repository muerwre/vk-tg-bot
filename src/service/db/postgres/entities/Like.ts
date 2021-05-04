import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { StoredLike } from "../../types";

@Entity()
export class Like implements StoredLike {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  messageId: number;
  @Column()
  channel: string;
  @Column({ type: "text" })
  text: string;
  @Column()
  author: number;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
