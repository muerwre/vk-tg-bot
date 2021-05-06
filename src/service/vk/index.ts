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
import { Storage } from "../db";

/**
 * Service to handle VK to Telegram interactions
 */
export class VkService {
  public endpoint: string = "/";
  private readonly instances: Record<string, GroupInstance>;
  private readonly groups: Record<number, ConfigGroup>;

  constructor(
    private config: VkConfig,
    private telegram: TelegramService,
    private templates: TemplateConfig,
    private db: Storage
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

      if (!groupId || !has(groupId, groups) || !has(groupId, this.instances)) {
        logger.warn(`vk received unknown call`, { body });
        res.sendStatus(200);
        return;
      }

      logger.debug(`received vk event`, { body });

      const inst = this.instances[groupId] as GroupInstance;

      inst.updates.getWebhookCallback(this.config.endpoint)(req, res, next);
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
      keys(channel).forEach((event) => {
        console.log(`updates in ${String(event)}`);
        updates.on(event as any, channel[event].execute);
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
  ): Record<VkEvent, VkEventHandler>[] {
    return flatten(
      group.channels.map((chan) =>
        chan.events.reduce((acc, event) => {
          const template = new Template(this.templates[event]);

          const handler = new vkEventToHandler[event](
            event,
            group,
            chan,
            instance,
            this,
            this.telegram,
            template,
            this.db
          );
          return { ...acc, [event]: handler };
        }, {} as Record<VkEvent, VkEventHandler>[])
      )
    );
  }
}
