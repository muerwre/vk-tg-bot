import { VkEvent } from "../vk/types";
import { StoredEvent, StoredLike } from "./types";

export interface Storage {
  getEvent(
    type: VkEvent,
    id: number,
    groupId: number,
    channel: string
  ): Promise<StoredEvent>;

  createEvent(event: StoredEvent): Promise<StoredEvent>;

  getLikesFor(channel: string, messageId: number): Promise<StoredLike[]>;

  getLikeBy(
    channel: string,
    messageId: number,
    author: number
  ): Promise<StoredLike>;
}
