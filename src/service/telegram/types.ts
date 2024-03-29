export interface WebhookConfig {
  url?: string;
  enabled?: boolean;
}

export interface TelegramConfig {
  key: string;
  owners?: string[];
  webhook: WebhookConfig;
  templates?: {
    help?: string;
    help_admin?: string;
  };
}
