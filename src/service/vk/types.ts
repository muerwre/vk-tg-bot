export interface VkConfig extends Record<string, any> {
  groups: ConfigGroup[];
  endpoint?: string;
}

interface ConfigGroup {
  id: number;
  name: string;
  testResponse: string;
  secretKey: string;
  apiKey: string;
  channels: GroupChannel[];
}

interface GroupChannel {
  id: string;
  events: VkEvent[];
}

export enum VkEvent {
  Confirmation = "confirmation",
  WallPostNew = "wall_post_new",
  PostSuggestion = "post_suggestion",
  GroupJoin = "group_join",
  GroupLeave = "group_leave",
  MessageNew = "message_new",
}
