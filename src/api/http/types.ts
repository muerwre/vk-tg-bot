export interface HttpConfig extends Record<string, any> {
  port: number;
  webhook?: {
    url?: string;
    enabled?: boolean;
  };
}
