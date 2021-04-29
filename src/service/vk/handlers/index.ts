import { ConfigGroup, GroupInstance, VkEvent } from "../types";
import { VkEventHandler } from "./VkEventHandler";
import { MessageNewHandler } from "./MessageNewHandler";
import { StubHandler } from "./StubHandler";
import { VkService } from "../index";
import { TelegramService } from "../../telegram";
import { Template } from "../../template";

interface Handler {
  new (
    type: VkEvent,
    group: ConfigGroup,
    channel: string,
    instance: GroupInstance,
    vk: VkService,
    telegram: TelegramService,
    template: Template<any, any>
  ): VkEventHandler;
}

export const vkEventToHandler: Record<VkEvent, Handler> = {
  [VkEvent.GroupJoin]: StubHandler,
  [VkEvent.GroupLeave]: StubHandler,
  [VkEvent.MessageNew]: MessageNewHandler,
  [VkEvent.PostSuggestion]: StubHandler,
  [VkEvent.WallPostNew]: StubHandler,
};
