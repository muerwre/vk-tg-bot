import { Storage } from "../index";
import { VkEvent } from "../../vk/types";
import { PostgresConfig } from "./types";
import { Connection, createConnection, Repository } from "typeorm";
import logger from "../../logger";
import path from "path";
import { Like } from "./entities/Like";
import { Event } from "./entities/Event";

const entities = [path.join(__dirname, "./entities/*")];

export class PostgresDB implements Storage {
  private connection: Connection;
  private events: Repository<Event>;
  private likes: Repository<Like>;

  constructor(private config: PostgresConfig) {}

  connect = async () => {
    this.connection = await createConnection({
      type: "postgres",
      url: this.config.uri,
      entities,
      logging: true,
      synchronize: true,
    });

    await this.connection.synchronize();

    this.events = this.connection.getRepository(Event);
    this.likes = this.connection.getRepository(Like);

    logger.info(`db connected to ${this.config.uri}`);
  };

  getEvent = async (
    type: VkEvent,
    eventId: number,
    groupId: number,
    channel: string
  ) => {
    return await this.events.findOne({ type, eventId, groupId, channel });
  };

  createEvent = async (
    type: VkEvent,
    eventId: number,
    groupId: number,
    channel: string,
    tgMessageId: number,
    text: Record<any, any>
  ) => {
    const event = this.events.create({
      type,
      eventId,
      groupId,
      channel,
      tgMessageId,
      text,
    });

    return await this.events.save(event);
  };

  getLikesFor = async (channel, messageId) => {
    return await this.likes.find({
      where: { channel, messageId },
    });
  };

  getLikeBy = async (channel, messageId, author) => {
    return this.likes.findOne({
      channel,
      messageId,
      author,
    });
  };

  createOrUpdateLike = async ({
    channel,
    author,
    text,
    messageId,
  }: Partial<Like>) => {
    const like = await this.likes.findOne({ channel, author, messageId });

    if (like) {
      like.text = text;
      return await this.likes.save(like);
    } else {
      const created = await this.likes.create({
        channel,
        author,
        text,
        messageId,
      });
      return created[0];
    }
  };
}
