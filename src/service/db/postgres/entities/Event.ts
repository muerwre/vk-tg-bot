import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { StoredEvent } from "../../types";
import { VkEvent } from "../../../vk/types";

@Entity()
export class Event implements StoredEvent {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  type: VkEvent;
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
}
