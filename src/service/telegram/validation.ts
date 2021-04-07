import * as yup from 'yup';

export const telegramConfigSchema = yup.object().required().shape({
  key: yup.string().required(),
  webhookUrl: yup.string().notRequired(),
})
