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
  vkEventId: number;
  @Column()
  vkGroupId: number;
  @Column()
  channel: string;
  @Column()
  tgMessageId: number;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @Column("simple-json", { default: {}, nullable: false })
  text: Record<any, any>;
}
