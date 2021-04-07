import * as yup from 'yup'
import { VkConfig, VkEvent } from './types';

const vkChannelEventSchema = yup.string().oneOf(Object.values(VkEvent))

const vkChannelSchema = yup.object().required().shape({
  id: yup.string().required().matches(/^@/, ({ path }) => `${path} should start with "@"`),
  events: yup.array().of(vkChannelEventSchema)
})

export const vkConfigSchema = yup.object<VkConfig>().required().shape({
  groups: yup.array().required().of(yup.object().shape({
    id: yup.number().positive(),
    name: yup.string().required(),
    testResponse: yup.string().required(),
    secretKey: yup.string().required(),
    apiKey: yup.string().required(),
    channels: yup.array().of(vkChannelSchema),
  }))
})
