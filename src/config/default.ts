import { Config } from "./types";

export const defaultConfig: Config = {
  http: { port: 80 },
  telegram: {
    owners: [],
    key: "",
    webhook: { url: "", enabled: false },
  },
  postgres: {
    uri: "postgres://user:password@db/bot",
  },
  logger: { level: "info" },
  vk: {
    endpoint: "/",
    groups: [],
  },
  templates: {
    help: "templates/help.md",
    help_admin: "templates/help_admin.md",
    message_new: "templates/message_new.md",
    wall_post_new: "templates/post_new.md",
    group_join: "templates/group_join.md",
    group_leave: "templates/group_leave.md",
  },
};
