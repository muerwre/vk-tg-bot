import { VkEvent } from "../types";
import { VkEventHandler } from "./types";
import { MessageNewHandler } from "./MessageNewHandler";

export const vkEventToHandler: Record<VkEvent, typeof VkEventHandler> = {
  [VkEvent.GroupJoin]: VkEventHandler,
  [VkEvent.GroupLeave]: VkEventHandler,
  [VkEvent.MessageNew]: MessageNewHandler,
  [VkEvent.PostSuggestion]: VkEventHandler,
  [VkEvent.WallPostNew]: VkEventHandler,
};
