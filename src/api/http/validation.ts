import { boolean, number, object, string } from "yup";

export const httpConfigSchema = object()
  .required()
  .shape({
    port: number().defined().required().positive(),
    webhook: object().optional().shape({
      url: string(),
      enabled: boolean(),
    }),
  });
