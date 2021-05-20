import * as yup from "yup";
import { VkConfig, VkEvent } from "./types";
import { templateOptionalSchema } from "../../config/validate";

const vkChannelEventSchema = yup.string().oneOf(Object.values(VkEvent));

const vkChannelSchema = yup
  .object()
  .required()
  .shape({
    id: yup
      .string()
      .required()
      .matches(/^@/, ({ path }) => `${path} should start with "@"`),
    events: yup.array().of(vkChannelEventSchema),
    templates: templateOptionalSchema,
  });

export const vkConfigSchema = yup
  .object<VkConfig>()
  .required()
  .shape({
    endpoint: yup.string().optional(),
    groups: yup
      .array()
      .required()
      .of(
        yup.object().shape({
          id: yup.number().positive(),
          name: yup.string().required(),
          testResponse: yup.string().required(),
          secretKey: yup.string().required(),
          apiKey: yup.string().required(),
          channels: yup.array().of(vkChannelSchema),
          templates: templateOptionalSchema,
        })
      ),
  });
