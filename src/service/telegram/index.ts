import { TelegramConfig } from './types';
import { Telegraf } from 'telegraf';
import logger from '../logger';

// import SocksProxyAgent from 'socks-proxy-agent';

export class TelegramService {
  bot: Telegraf

  constructor(private props: TelegramConfig) {
    if (!props.key) {
      throw new Error('Telegram api key not found. Get it from bot father')
    }

    // const agent = (CONFIG.PROXY && new SocksProxyAgent(CONFIG.PROXY)) || null;
    const options = {
      channelMode: true,
      telegram: {
        // agent, // TODO: add proxy support
        webhookReply: !!props.webhookUrl,
      },
    };

    this.bot = new Telegraf(props.key, options);

    process.once('SIGINT', () => this.bot.stop('SIGINT'))
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'))

    logger.info('Telegram service started')
  }

  start() {
    if (!this.bot) {
      throw new Error('Not initialized')
    }

    return this.bot.launch()
  }
}
