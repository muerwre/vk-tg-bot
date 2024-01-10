import { API, Upload, Updates } from "vk-io";
import { WallPostType } from "vk-io/lib/api/schemas/objects";
import { TemplateConfig } from "../../config/types";
import { CalendarGroupConfig } from "../calendar/config";

export interface VkConfig extends Record<string, any> {
  groups: ConfigGroup[];
  endpoint?: string;
}

export interface ConfigGroup {
  id: number;
  name: string;
  testResponse: string;
  secretKey: string;
  apiKey: string;
  channels: GroupChannel[];
  templates: Partial<TemplateConfig>;
  calendar?: Partial<CalendarGroupConfig>;
}

export interface GroupChannel {
  id: string;
  events: VkEvent[];
  post_types: WallPostType[];
  templates: Partial<TemplateConfig>;
  markdown?: boolean;
}

export enum VkEvent {
  WallPostNew = "wall_post_new",
  GroupJoin = "group_join",
  GroupLeave = "group_leave",
  MessageNew = "message_new",
}

export interface GroupInstance {
  api: API;
  upload: Upload;
  updates: Updates;
}

export interface Calendar {
  createEvent: (
    calendarId: string,
    start: Date,
    end: Date,
    summary: string,
    description: string,
    eventId: string
  ) => Promise<void>;
}
