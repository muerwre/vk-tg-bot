import { VkEvent } from "../types";
import { VkEventHandler } from "./VkEventHandler";
import { MessageNewHandler } from "./MessageNewHandler";

type DerivedHandler = typeof VkEventHandler;
interface Handler extends DerivedHandler {}

export const vkEventToHandler: Record<VkEvent, Handler> = {
  [VkEvent.GroupJoin]: MessageNewHandler,
  [VkEvent.GroupLeave]: MessageNewHandler,
  [VkEvent.MessageNew]: MessageNewHandler,
  [VkEvent.PostSuggestion]: MessageNewHandler,
  [VkEvent.WallPostNew]: MessageNewHandler,
};
