import { VkEventHandler } from "./VkEventHandler";
import { GroupMemberContext } from "vk-io";
import { NextMiddleware } from "middleware-io";
import logger from "../../logger";
import { UsersUserFull } from "vk-io/lib/api/schemas/objects";
import { ConfigGroup } from "../types";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";

interface Fields {}

interface Values {
  user?: UsersUserFull;
  group: ConfigGroup;
  isJoined: boolean;
  isLeave: boolean;
  count: number;
}

export class JoinLeaveHandler extends VkEventHandler<Fields, Values> {
  public execute = async (
    context: GroupMemberContext,
    next: NextMiddleware
  ) => {
    const user = await this.getUserByID(String(context.userId));
    const dir = context.isJoin ? "joined" : "left";
    const count = await this.getMembersCount();
    const { first_name = "[unknown]", last_name = "[unknown]" } = user || {};

    logger.debug(
      `vk, group ${this.group.name}: ${first_name} ${last_name} ${dir} the group`
    );

    const parsed = this.template.theme(
      {
        user,
        group: this.group,
        isJoined: context.isJoin,
        isLeave: context.isLeave,
        count,
      },
      !!this.channel.markdown
    );

    const extras: ExtraReplyMessage = {
      disable_web_page_preview: true,
    };

    await this.telegram.sendMessageToChan(
      this.channel.id,
      parsed,
      !!this.channel.markdown,
      extras
    );

    await next();
  };

  /**
   * Returns current members count
   * @private
   */
  private getMembersCount = async () => {
    const resp = await this.instance.api.groups.getMembers({
      group_id: this.group.id.toString(),
    });

    return resp.count;
  };
}
