import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { VkEvent } from "../../../vk/types";

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  type: VkEvent;
  @Column()
  eventId: number;
  @Column()
  groupId: number;
  @Column()
  channel: string;
  @Column()
  tgMessageId: number;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @Column({ type: "text", default: "", nullable: false })
  text: string;
}
