import { ConfigGroup, GroupChannel, GroupInstance, VkEvent } from "../types";
import { VkEventHandler } from "./VkEventHandler";
import { MessageNewHandler } from "./MessageNewHandler";
import { StubHandler } from "./StubHandler";
import { VkService } from "../index";
import { TelegramService } from "../../telegram";
import { Template } from "../../template";
import { PostNewHandler } from "./PostNewHandler";
import { Storage } from "../../db";

interface Handler {
  new (
    type: VkEvent,
    group: ConfigGroup,
    channel: GroupChannel,
    instance: GroupInstance,
    vk: VkService,
    telegram: TelegramService,
    template: Template<any, any>,
    db: Storage
  ): VkEventHandler;
}

export const vkEventToHandler: Record<VkEvent, Handler> = {
  [VkEvent.GroupJoin]: StubHandler,
  [VkEvent.GroupLeave]: StubHandler,
  [VkEvent.MessageNew]: MessageNewHandler,
  [VkEvent.WallPostNew]: PostNewHandler,
};
