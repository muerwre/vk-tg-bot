import { NextMiddleware } from "middleware-io";
import { ConfigGroup, GroupChannel, GroupInstance, VkEvent } from "../types";
import { VkService } from "../index";
import { TelegramService } from "../../telegram";
import { Template } from "../../template";
import { Storage } from "../../db";
import { Event } from "../../db/postgres/entities/Event";

export class VkEventHandler<
  F extends Record<string, any> = any,
  V extends Record<string, any> = any
> {
  public constructor(
    protected type: VkEvent,
    protected group: ConfigGroup,
    protected channel: GroupChannel,
    protected instance: GroupInstance,
    protected vk: VkService,
    protected telegram: TelegramService,
    protected template: Template<F, V>,
    protected db: Storage
  ) {}

  public execute: (
    context: any,
    next: NextMiddleware
  ) => Promise<void> = async (ctx, next) => {
    console.log(`vk received unknown event`, ctx);
    await next();
  };

  /**
   * Fetches user by id
   * @param id
   */
  protected getUserByID = async (id: string) => {
    const users = await this.instance.api.users.get({
      user_ids: [id],
      fields: ["sex"],
    });

    return users[0];
  };

  /**
   * Returns url for group dialog
   */
  protected makeDialogUrl = (groupId: number, userId: number): string =>
    `https://vk.com/gim${groupId}?sel=${userId}`;

  /**
   * Checks for duplicates
   */
  getEventById = async (id?: number): Promise<Event | undefined> => {
    if (!id) {
      return undefined;
    }

    return await this.db.getEventById(id);
  };

  /**
   * Checks for duplicates
   */
  getEventByVkEventId = async (id?: number): Promise<Event | undefined> => {
    if (!id) {
      return undefined;
    }

    return await this.db.getEventByVKEventId(
      this.type,
      id,
      this.group.id,
      this.channel.id
    );
  };

  /**
   * Checks for duplicates
   */
  getEventByTgMessageId = async (
    tgMessageId?: number
  ): Promise<Event | undefined> => {
    if (!tgMessageId) {
      return undefined;
    }

    return await this.db.getEventByMessageId(
      this.type,
      tgMessageId,
      this.group.id,
      this.channel.id
    );
  };

  /**
   * Creates event record in DB
   */
  createEvent = async (
    id: number,
    tgMessageId: number,
    text: Record<any, any>
  ) => {
    return await this.db.createEvent(
      this.type,
      id,
      this.group.id,
      this.channel.id,
      tgMessageId,
      text
    );
  };
}
