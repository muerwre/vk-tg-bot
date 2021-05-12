import { API, Upload, Updates } from "vk-io";
import { WallPostType } from "vk-io/lib/api/schemas/objects";

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
}

export interface GroupChannel {
  id: string;
  events: VkEvent[];
  post_types: WallPostType[];
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
