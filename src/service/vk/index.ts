import { ConfigGroup, GroupInstance, VkConfig, VkEvent } from "./types";
import { API, Updates, Upload } from "vk-io";
import logger from "../logger";
import { Request, Response } from "express";
import { flatten, has, keys } from "ramda";
import { NextFunction } from "connect";
import { VkEventHandler } from "./handlers/VkEventHandler";
import { vkEventToHandler } from "./handlers";
import { TelegramService } from "../telegram";
import { Template } from "../template";
import { TemplateConfig } from "../../config/types";
import { PostgresDB } from "../db/postgres";
import { CalendarService } from "../calendar";

/**
 * Service to handle VK to Telegram interactions
 */
export class VkService {
  public endpoint: string = "/";
  private readonly instances: Record<string, GroupInstance>;
  private readonly groups: Record<number, ConfigGroup>;

  // Used to register all incoming events
  private incomingEvents: string[] = [];

  constructor(
    private config: VkConfig,
    private telegram: TelegramService,
    private templates: TemplateConfig,
    private db: PostgresDB,
    private calendar: CalendarService | null
  ) {
    if (!config.groups.length) {
      throw new Error("No vk groups to handle. Specify them in config");
    }

    this.endpoint = config.endpoint || "/";

    this.groups = config.groups.reduce(
      (acc, group) => ({
        ...acc,
        [group.id]: group,
      }),
      {}
    );

    this.instances = config.groups.reduce(
      (acc, group) => ({
        ...acc,
        [group.id]: this.createGroupInstance(group),
      }),
      {}
    );
  }

  /**
   * Handles incoming VK events
   */
  public handle = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body } = req;
      const { groups } = this;
      const groupId = body?.group_id;
      const group = this.groups[groupId];
      const eventId = body?.event_id;
      const type = body?.type;

      await this.db.insertRequest(body);

      if (!groupId || !has(groupId, groups) || !has(groupId, this.instances)) {
        logger.warn(`vk received unknown call`, body);
        res.sendStatus(200);
        return;
      }

      if (eventId) {
        if (this.incomingEvents.includes(eventId)) {
          logger.warn(
            `received duplicate event "${type} (${eventId})" for group "${group.name} (skipping)"`
          );
          return res.send("OK");
        }

        this.incomingEvents.push(eventId);
      }

      logger.debug(`received vk event`, { body });

      const inst = this.instances[groupId] as GroupInstance;

      await inst.updates.getWebhookCallback(this.config.endpoint)(
        req,
        res,
        next
      );
    } catch (e) {
      next(e);
    }
  };

  /**
   * Creates vk bot instance for each group with api, uploader and updates handler
   */
  private createGroupInstance = (group: ConfigGroup): GroupInstance => {
    const api = new API({
      token: group.apiKey,
    });
    const upload = new Upload({ api });
    const updates = new Updates({
      api,
      upload,
      webhookConfirmation: group.testResponse,
      webhookSecret: group.secretKey,
    });

    const instance = {
      api,
      upload,
      updates,
    };

    const handlers = this.setupHandlers(group, instance);

    handlers.forEach((channel) => {
      keys(channel).forEach((event: VkEvent) => {
        logger.info(` - ${group.name} listens for ${String(event)}`);
        channel[event].forEach((handler) => {
          updates.on(event as any, handler.execute);
        });
      });
    });

    return instance;
  };

  /**
   * Setups handlers
   */
  private setupHandlers(
    group: ConfigGroup,
    instance: GroupInstance
  ): Record<VkEvent, VkEventHandler[]>[] {
    return flatten(
      group.channels.map((chan) =>
        chan.events.reduce((acc, event) => {
          const template = new Template(
            chan?.templates?.[event] ??
              group?.templates?.[event] ??
              this.templates?.[event]
          );

          const handlers = vkEventToHandler[event]?.map(
            (handler) =>
              new handler(
                event,
                group,
                chan,
                instance,
                this,
                this.telegram,
                template,
                this.db,
                this.calendar
              )
          );
          return { ...acc, [event]: handlers };
        }, {} as Record<VkEvent, VkEventHandler>[])
      )
    );
  }

  /**
   * Performs healthcheck for telegram
   */
  public healthcheck = async () => {
    await this.db.healthcheck();
  };
}
