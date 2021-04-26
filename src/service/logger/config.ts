import { object, string } from "yup";

export const loggerConfigSchema = object().shape({
  level: string().optional().oneOf(["debug", "info", "warn", "error"]),
});
