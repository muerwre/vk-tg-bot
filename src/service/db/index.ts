import { VkEvent } from "../vk/types";
import { StoredEvent, StoredLike } from "./types";
import { Like } from "./postgres/entities/Like";

export interface Storage {
  getEvent(
    type: VkEvent,
    id: number,
    groupId: number,
    channel: string
  ): Promise<StoredEvent>;

  createEvent(event: Partial<StoredEvent>): Promise<StoredEvent>;

  createOrUpdateLike(like: Partial<StoredLike>): Promise<Like>;

  getLikesFor(channel: string, messageId: number): Promise<StoredLike[]>;

  getLikeBy(
    channel: string,
    messageId: number,
    author: number
  ): Promise<StoredLike>;
}
