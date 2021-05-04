import { VkEvent } from "../vk/types";

export interface Event {
  type: VkEvent;
  id: number;
  groupId: number;
  channel: string;
  tgMessageId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Like {
  messageId: number;
  channel: string;
  text: string;
  author: number;
  createdAt: Date;
  updatedAt: Date;
}
