import { addMinutes, isBefore, secondsToMilliseconds } from "date-fns";
import { NextMiddleware } from "middleware-io";
import { WallPostContext } from "vk-io";
import { getDateFromText } from "../../../utils/date/getDateFromText";
import logger from "../../logger";
import { VkEventHandler } from "./VkEventHandler";
import { getSummaryFromText } from "../../../utils/text/getSummaryFromText";
import { maybeTrim } from "../../../utils/text/maybeTrim";


export class PostNewCalendarHandler extends VkEventHandler {
  constructor(...props: ConstructorParameters<typeof VkEventHandler>) {
    super(...props);
  }

  public execute = async (context: WallPostContext, next: NextMiddleware) => {
    try {
      const id = context?.wall?.id;
      const postType = context?.wall?.postType;
      const text = context.wall.text;
      const createdAt = context.wall.createdAt && new Date(secondsToMilliseconds(context.wall.createdAt));
      const eventId = context.wall.id.toString();

      if (context.isRepost || !id || !this.group.calendar?.id || !this.group.calendar.enabled || !this.calendar || !text || !createdAt) {
        return;
      }

      if (!this.isValidPostType(postType)) {
        logger.info(
          `skipping wall_post_new for ${this.group.name
          }#${id} since it have type '${postType}', which is not in [${this.channel.post_types.join(
            ","
          )}]`
        );

        return;
      }

      const summary = getSummaryFromText(text);

      const start = getDateFromText(text, createdAt);
      if (!start) {
        logger.warn(`can't extract date from summary: ${summary}`)
        return;
      }

      if (isBefore(start, createdAt)) {
        logger.warn(`extracted date was from the past: ${start?.toISOString()}, summary was: ${summary}`)
        return;
      }

      const end = addMinutes(start, 15);
      const description = [this.generateVkPostUrl(context.wall.id), maybeTrim(text, 512)].join('\n\n');

      this.calendar?.createEvent(this.group.calendar?.id, start, end, summary, description, eventId)
    } catch (error) {
      logger.warn('error occurred in calendar handler', error);
    } finally {
      await next();
    }
  };

  /**
   * Checks if event of type we can handle
   */
  private isValidPostType(type?: string) {
    return !!type && type === "post";
  }

  /**
 * Generates urls for postId
 */
  generateVkPostUrl = (postId?: number) =>
    `https://vk.com/wall-${this.group.id}_${postId}`;

}
