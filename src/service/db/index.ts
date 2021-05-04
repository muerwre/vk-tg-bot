import { VkEvent } from "../vk/types";
import { Like } from "./postgres/entities/Like";
import { Event } from "./postgres/entities/Event";

export interface Storage {
  getEvent(
    type: VkEvent,
    id: number,
    groupId: number,
    channel: string
  ): Promise<Event>;

  createEvent(event: Partial<Event>): Promise<Event>;

  createOrUpdateLike(like: Partial<Like>): Promise<Like>;

  getLikesFor(channel: string, messageId: number): Promise<Like[]>;

  getLikeBy(channel: string, messageId: number, author: number): Promise<Like>;
}
