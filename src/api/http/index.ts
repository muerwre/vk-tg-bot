import { HttpConfig } from "./types";
import { VkService } from "../../service/vk";
import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import loggerHttpMiddleware from "../../service/logger/http";
import logger from "../../service/logger";
import { TelegramService } from "../../service/telegram";
import http from "http";
import { WebhookConfig } from "../../config/types";
import { URL } from "url";
import { corsMiddleware, errorMiddleware } from "./middleware";

export class HttpApi {
  app: Express;

  constructor(
    private props: HttpConfig,
    private telegram: TelegramService,
    private vk: VkService,
    private webhook?: WebhookConfig
  ) {
    this.app = express();
    this.app.use(corsMiddleware);
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(loggerHttpMiddleware);

    this.app.use(bodyParser.json());
    this.app.use(express.json());

    if (this?.webhook?.enabled && this?.webhook?.url) {
      const url = new URL(this.webhook.url);
      logger.info(`using webhook at ${url.pathname}`);
      this.app.post(url.pathname, this.handleWebhook);
    }

    this.app.use(errorMiddleware);
  }

  /**
   * Starts http server
   */
  public async listen() {
    const httpServer = http.createServer(this.app);
    httpServer.listen(this.props.port);
    logger.info(`http api listening at ${this.props.port}`);
  }

  /**
   * Handles telegram webhooks
   */
  private handleWebhook = async (req: Request, res: Response) => {
    logger.debug("got message via webhook", req.body);
    await this.telegram.handleUpdate(req.body, res);
  };
}
