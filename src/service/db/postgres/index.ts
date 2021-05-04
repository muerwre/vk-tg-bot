import { Storage } from "../index";
import { VkEvent } from "../../vk/types";
import { Event } from "../types";
import { PostgresConfig } from "./types";
import { Connection, createConnection } from "typeorm";

export class PostgresDB implements Storage {
  private connection: Connection;
  constructor(private config: PostgresConfig) {}

  connect = async () => {
    this.connection = await createConnection({
      type: "postgres",
      url: this.config.uri,
    });
  };

  getEvent = async (
    type: VkEvent,
    id: number,
    groupId: number,
    channel: string
  ) => {
    return {
      type,
      id,
      groupId,
      channel,
      tgMessageId: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  };

  createEvent = async (event: Event) => event;

  getLikesFor = async (channel: string, messageId: number) => [];

  getLikeBy = async (channel: string, messageId: number, author: number) => ({
    channel,
    messageId,
    author,
    text: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}
