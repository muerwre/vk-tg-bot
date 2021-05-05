import { VkEvent } from "../vk/types";
import { Like } from "./postgres/entities/Like";
import { Event } from "./postgres/entities/Event";
import { Post } from "./postgres/entities/Post";

export interface Storage {
  getEventByMessageId(
    type: VkEvent,
    tgMessageId: number,
    groupId: number,
    channel: string
  ): Promise<Event>;
  getEventById(
    type: VkEvent,
    eventId: number,
    groupId: number,
    channel: string
  ): Promise<Event>;
  createEvent(
    type: VkEvent,
    eventId: number,
    groupId: number,
    channel: string,
    tgMessageId: number,
    text: Record<any, any>
  ): Promise<Event>;
  createOrUpdateLike(
    messageId: number,
    channel: string,
    author: number,
    text: string
  ): Promise<Like>;
  getLikesFor(channel: string, messageId: number): Promise<Like[]>;
  getLikeBy(channel: string, messageId: number, author: number): Promise<Like>;
  createPost(eventId: number, text: string): Promise<Post>;
  findPostByEvent(eventId: number): Promise<Post>;
}
