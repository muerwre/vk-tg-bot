import { ConfigGroup, GroupInstance, VkConfig, VkEvent } from "./types";
import { API, Upload, Updates } from "vk-io";
import logger from "../logger";
import { Request, Response } from "express";
import { flatten, has, keys } from "ramda";
import { NextFunction } from "connect";
import { VkEventHandler } from "./handlers/types";
import { vkEventToHandler } from "./handlers";

export class VkService {
  public endpoint: string = "/";
  private readonly instances: Record<string, GroupInstance>;
  private readonly groups: Record<number, ConfigGroup>;

  constructor(private config: VkConfig) {
    if (!config.groups.length) {
      throw new Error("No vk groups to handle. Specify them in config");
    }

    this.endpoint = config.endpoint;

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

  private createGroupInstance = (group: ConfigGroup): GroupInstance => {
    const api = new API({
      token: group.apiKey,
      apiBaseUrl: this.config.endpoint,
    });
    const upload = new Upload({ api });
    const updates = new Updates({
      api,
      upload,
      webhookConfirmation: group.testResponse,
      webhookSecret: group.secretKey,
    });

    const handlers = this.setupHandlers(group);
    handlers.forEach((channel) => {
      keys(channel).forEach((event) => {
        console.log(`updates in ${String(event)}`);
        updates.on(event as any, channel[event].execute);
      });
    });

    return {
      api,
      upload,
      updates,
    };
  };

  /**
   * Setups handlers
   */
  private setupHandlers(group: ConfigGroup): Record<VkEvent, VkEventHandler>[] {
    return flatten(
      group.channels.map((chan) =>
        chan.events.reduce((acc, event) => {
          const handler = vkEventToHandler[event];
          return { ...acc, [event]: new handler(group) };
        }, {} as Record<VkEvent, VkEventHandler>[])
      )
    );
  }
}
