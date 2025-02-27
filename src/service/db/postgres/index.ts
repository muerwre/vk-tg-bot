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
import { Log } from "./entities/Log";

export class PostgresDB implements Storage {
  private connection!: Connection;
  private events!: Repository<Event>;
  private likes!: Repository<Like>;
  private posts!: Repository<Post>;
  private requests!: Repository<Request>;
  private logs!: Repository<Log>;

  constructor(
    private config: PostgresConfig,
    private loggerConfig: LoggerConfig
  ) {}

  connect = async () => {
    logger.info(`connecting to ${this.config.uri}`);

    this.connection = await createConnection({
      type: "postgres",
      url: this.config.uri,
      logging: this.loggerConfig.level === "debug",
      synchronize: true,
      entities: [Event, Like, Post, Request, Log],
    });

    await this.connection.synchronize();

    this.events = this.connection.getRepository(Event);
    this.likes = this.connection.getRepository(Like);
    this.posts = this.connection.getRepository(Post);
    this.requests = this.connection.getRepository(Request);
    this.logs = this.connection.getRepository(Log);

    logger.info(`db connected to ${this.config.uri}`);
  };

  getEventByMessageId = async (
    type: VkEvent,
    tgMessageId: number,
    vkGroupId: number,
    channel: string
  ) => {
    return await this.events.findOne({
      where: {
        type,
        tgMessageId,
        vkGroupId,
        channel,
      },
    });
  };

  getEventByVKEventId = async (
    type: VkEvent,
    vkEventId: number,
    vkGroupId: number,
    channel: string
  ) => {
    return await this.events.findOne({
      where: {
        type,
        vkEventId,
        vkGroupId,
        channel,
      },
    });
  };
  getEventById = async (id: number) => {
    return await this.events.findOne({
      where: {
        id,
      },
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
      where: {
        channel,
        messageId,
        author,
      },
    });
  };

  createOrUpdateLike = async (messageId, channel, author, text) => {
    const like = await this.likes.findOne({
      where: { channel, author, messageId },
    });

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
    return this.posts.findOne({ where: { eventId } });
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

  insertLog = async (
    level: string,
    message: string,
    body: Record<any, any>
  ) => {
    return this.logs.save({ message, level, body });
  };

  /**
   * Returns last request with shift
   */
  popLogs = async (take: number = 20, skip: number = 0) => {
    const requests = await this.logs.find({
      order: { createdAt: "DESC" },
      take,
      skip,
    });

    return requests.reverse();
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
