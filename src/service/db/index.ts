import { VkEvent } from "../vk/types";
import { Event, Like } from "./types";

export interface Storage {
  getEvent(
    type: VkEvent,
    id: number,
    groupId: number,
    channel: string
  ): Promise<Event>;

  createEvent(event: Event): Promise<Event>;

  getLikesFor(channel: string, messageId: number): Promise<Like[]>;

  getLikeBy(channel: string, messageId: number, author: number): Promise<Like>;
}
