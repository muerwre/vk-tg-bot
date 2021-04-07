import { TelegramConfig } from './types';

export class TelegramService {
  constructor(private props: TelegramConfig) {
    if (!props.key) {
      throw new Error('Telegram api key not found. Get it from bot father')
    }
  }
}
