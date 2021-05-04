import { object, string } from "yup";

export const dbConfigValidatior = object().shape({
  uri: string()
    .required()
    .matches(/^postgres:/),
});
