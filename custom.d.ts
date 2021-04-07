declare module "js-yaml" {
  let load: <T extends Record<any, any>>(path: string) => T
}
