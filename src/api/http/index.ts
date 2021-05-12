import { HttpConfig } from "./types";
import { VkService } from "../../service/vk";
import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import loggerHttpMiddleware from "../../service/logger/http";
import logger from "../../service/logger";
import { TelegramService } from "../../service/telegram";
import http from "http";
import { URL } from "url";
import { corsMiddleware, errorMiddleware } from "./middleware";
import { WebhookConfig } from "../../service/telegram/types";

export class HttpApi {
  app!: Express;
  webhook!: WebhookConfig;

  constructor(
    private props: HttpConfig,
    private telegram: TelegramService,
    private vk: VkService
  ) {
    this.webhook = this.telegram.webhook;

    this.app = express();
    this.app.use(corsMiddleware);
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(loggerHttpMiddleware);

    this.app.use(bodyParser.json());
    this.app.use(express.json());

    this.setupHandlers();

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
   * Adds webhandlers
   */
  private setupHandlers() {
    // Webhooks (if available)
    if (this?.webhook?.enabled && this?.webhook?.url) {
      const url = new URL(this.webhook.url);
      logger.info(`using webhook at ${url.pathname}`);
      this.app.post(url.pathname, this.handleWebhook);
      this.app.get(url.pathname, this.healthcheck);
    }

    // VK event handler
    this.app.post(this.vk.endpoint, this.vk.handle);
    this.app.get("/", this.healthcheck);
  }

  /**
   * Handles telegram webhooks
   */
  private handleWebhook = async (req: Request, res: Response) => {
    logger.debug("got message via webhook", req.body);
    await this.telegram.handleUpdate(req.body, res);
  };

  /**
   * Just returns 200
   */
  private healthcheck = async (req: Request, res: Response) => {
    try {
      await Promise.all([this.telegram.healthcheck(), this.vk.healthcheck()]);
      res.sendStatus(200);
    } catch (e) {
      res.sendStatus(501);
    }
  };
}
