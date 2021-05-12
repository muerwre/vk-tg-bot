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
  ): Promise<Event | undefined>;
  getEventById(eventId: number): Promise<Event | undefined>;
  getEventByVKEventId(
    type: VkEvent,
    eventId: number,
    groupId: number,
    channel: string
  ): Promise<Event | undefined>;
  createEvent(
    type: VkEvent,
    eventId: number,
    groupId: number,
    channel: string,
    tgMessageId: number,
    text: Record<any, any>
  ): Promise<Event | undefined>;
  createOrUpdateLike(
    messageId: number,
    channel: string,
    author: number,
    text: string
  ): Promise<Like>;
  getLikesFor(channel: string, messageId: number): Promise<Like[]>;
  getLikeBy(
    channel: string,
    messageId: number,
    author: number
  ): Promise<Like | undefined>;
  createPost(
    eventId: number,
    text: string,
    vkPostId: number
  ): Promise<Post | undefined>;
  findPostByEvent(eventId: number): Promise<Post | undefined>;
}
