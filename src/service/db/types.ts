import { VkEvent } from "../vk/types";

export interface StoredEvent {
  type: VkEvent;
  id: number;
  groupId: number;
  channel: string;
  tgMessageId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoredLike {
  id: number;
  messageId: number;
  channel: string;
  text: string;
  author: number;
  createdAt: Date;
  updatedAt: Date;
}
