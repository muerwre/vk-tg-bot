import {
  Calendar,
  ConfigGroup,
  GroupChannel,
  GroupInstance,
  VkEvent,
} from "../types";
import { VkEventHandler } from "./VkEventHandler";
import { MessageNewHandler } from "./MessageNewHandler";
import { VkService } from "../index";
import { TelegramService } from "../../telegram";
import { Template } from "../../template";
import { PostNewHandler } from "./PostNewHandler";
import { Storage } from "../../db";
import { JoinLeaveHandler } from "./JoinLeaveHandler";
import { PostNewCalendarHandler } from "./PostNewCalendarHandler";

interface Handler {
  new (
    type: VkEvent,
    group: ConfigGroup,
    channel: GroupChannel,
    instance: GroupInstance,
    vk: VkService,
    telegram: TelegramService,
    template: Template<any, any>,
    db: Storage,
    calendar: Calendar | null
  ): VkEventHandler;
}

export const vkEventToHandler: Record<VkEvent, Handler[]> = {
  [VkEvent.GroupJoin]: [JoinLeaveHandler],
  [VkEvent.GroupLeave]: [JoinLeaveHandler],
  [VkEvent.MessageNew]: [MessageNewHandler],
  [VkEvent.WallPostNew]: [PostNewHandler, PostNewCalendarHandler],
};
