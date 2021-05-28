import * as yup from "yup";
import { boolean, object, string } from "yup";

const webhookValidationSchema = object().optional().shape({
  url: string(),
  enabled: boolean(),
});

export const telegramConfigSchema = yup
  .object()
  .required()
  .shape({
    key: yup.string().required(),
    owners: yup.array().of(yup.string().required()),
    webhook: webhookValidationSchema,
  });
