import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  eventId: number;
  @Column({ type: "text" })
  text: string;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
