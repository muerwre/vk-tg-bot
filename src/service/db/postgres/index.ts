import { Storage } from "../index";
import { VkEvent } from "../../vk/types";
import { PostgresConfig } from "./types";
import { Connection, createConnection, Repository } from "typeorm";
import logger from "../../logger";
import path from "path";
import { Like } from "./entities/Like";
import { Event } from "./entities/Event";
import { Post } from "./entities/Post";
import { LoggerConfig } from "../../logger/types";
import { Request } from "./entities/Request";

const entities = [path.join(__dirname, "./entities/*")];

export class PostgresDB implements Storage {
  private connection!: Connection;
  private events!: Repository<Event>;
  private likes!: Repository<Like>;
  private posts!: Repository<Post>;
  private requests!: Repository<Request>;

  constructor(
    private config: PostgresConfig,
    private loggerConfig: LoggerConfig
  ) {}

  connect = async () => {
    logger.info(`connecting to ${this.config.uri}`);

    this.connection = await createConnection({
      type: "postgres",
      url: this.config.uri,
      entities,
      logging: this.loggerConfig.level === "debug",
      synchronize: true,
    });

    await this.connection.synchronize();

    this.events = this.connection.getRepository(Event);
    this.likes = this.connection.getRepository(Like);
    this.posts = this.connection.getRepository(Post);
    this.requests = this.connection.getRepository(Request);

    logger.info(`db connected to ${this.config.uri}`);
  };

  getEventByMessageId = async (
    type: VkEvent,
    tgMessageId: number,
    vkGroupId: number,
    channel: string
  ) => {
    return await this.events.findOne({
      type,
      tgMessageId,
      vkGroupId,
      channel,
    });
  };

  getEventByVKEventId = async (
    type: VkEvent,
    vkEventId: number,
    vkGroupId: number,
    channel: string
  ) => {
    return await this.events.findOne({
      type,
      vkEventId,
      vkGroupId,
      channel,
    });
  };
  getEventById = async (id: number) => {
    return await this.events.findOne({
      id,
    });
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
      vkEventId: eventId,
      vkGroupId: groupId,
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

  createOrUpdateLike = async (messageId, channel, author, text) => {
    const like = await this.likes.findOne({ channel, author, messageId });

    if (like) {
      return await this.likes.save({ ...like, text });
    } else {
      return this.likes.save({
        channel,
        author,
        text,
        messageId,
      });
    }
  };

  findPostByEvent = async (eventId: number) => {
    return this.posts.findOne({ eventId });
  };

  createPost = async (eventId: number, text: string, vkPostId: number) => {
    return this.posts.save({ eventId, text, vkPostId });
  };

  insertRequest = async (body: Record<any, any>) => {
    return this.requests.save({ body });
  };

  /**
   * Returns last request with shift
   */
  popRequest = async (skip: number = 0) => {
    const requests = await this.requests.find({
      order: { createdAt: "DESC" },
      take: 1,
      skip,
    });
    return requests[0];
  };

  healthcheck = async () => {
    try {
      await this.connection.query("SELECT 1");
    } catch (e) {
      logger.warn("health check failed at db", e);
      throw e;
    }
  };
}
