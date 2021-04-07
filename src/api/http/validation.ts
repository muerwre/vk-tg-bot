import { number, object } from 'yup'

export const httpConfigSchema = object().required().shape({
  port: number().defined().required().positive(),
})
