export interface WebhookConfig {
  url?: string;
  enabled?: boolean;
}

export interface TelegramConfig {
  key: string;
  webhook: WebhookConfig;
}
