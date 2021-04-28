import { VkEvent } from "../types";
import { VkEventHandler } from "./VkEventHandler";
import { MessageNewHandler } from "./MessageNewHandler";
import { StubHandler } from "./StubHandler";

type DerivedHandler = typeof VkEventHandler;
interface Handler extends DerivedHandler {}

export const vkEventToHandler: Record<VkEvent, Handler> = {
  [VkEvent.GroupJoin]: StubHandler,
  [VkEvent.GroupLeave]: StubHandler,
  [VkEvent.MessageNew]: MessageNewHandler,
  [VkEvent.PostSuggestion]: StubHandler,
  [VkEvent.WallPostNew]: StubHandler,
};
