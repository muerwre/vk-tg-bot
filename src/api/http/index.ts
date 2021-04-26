import { HttpConfig } from "./types";
import { VkService } from "../../service/vk";
import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import loggerHttpMiddleware from "../../service/logger/http";
import logger from "../../service/logger";
import { TelegramService } from "../../service/telegram";
import http from "http";
import { WebhookConfig } from "../../config/types";
import url, { URL } from "url";

export class HttpApi {
  app: Express;

  constructor(
    private props: HttpConfig,
    private telegram: TelegramService,
    private vk: VkService,
    private webhook?: WebhookConfig
  ) {
    this.app = express();
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Methods",
        "GET, PUT, POST, DELETE, PATCH"
      );
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      next();
    });
    this.app.use(loggerHttpMiddleware);

    this.app.use(bodyParser.json());
    this.app.use(express.json());

    if (this?.webhook?.enabled && this?.webhook?.url) {
      const url = new URL(this.webhook.url);
      logger.info(`using webhook at ${url.pathname}`);
      this.app.post(url.pathname, this.handleWebhook);
    }
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
  private async handleWebhook(req: Request, res: Response) {
    return this.telegram.handleUpdate(req.body, res);
  }
}
