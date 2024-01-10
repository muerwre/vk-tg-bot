import { Asserts, boolean, object, string } from "yup";

export const calendarGroupConfigValidator = object({
  id: string().optional().email(),
  enabled: boolean().default(false),
});

export const calendarConfigValidator = object({
  keyFile: string().optional(),
  timezone: string().required().default(""),
});

export const calendarKeyValidator = object({
  type: string().required(),
  project_id: string().required(),
  private_key_id: string().required(),
  private_key: string().required(),
  client_email: string().required(),
  client_id: string().required(),
  auth_uri: string().required(),
  token_uri: string().required(),
  auth_provider_x509_cert_url: string().required(),
  client_x509_cert_url: string().required(),
  universe_domain: string().required(),
});

export type CalendarConfig = Asserts<typeof calendarConfigValidator>;
export type CalendarGroupConfig = Asserts<typeof calendarGroupConfigValidator>;
export type CalendarKeyFile = Asserts<typeof calendarKeyValidator>;
