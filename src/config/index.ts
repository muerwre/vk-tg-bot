import yaml from "js-yaml";
import fs from "fs";
import path from "path";
import { Config } from "./types";
import { validateConfig } from "./validate";
import { getCmdArg } from "../utils/args";
import { defaultConfig } from "./default";
import { merge } from "lodash";

const configPath = getCmdArg("config");
const data = fs.readFileSync(
  configPath || path.join(__dirname, "../config.yml"),
  "utf8"
);

const userConfig = yaml.load(data) as Config;

const config =
  (userConfig && merge(defaultConfig, userConfig)) || defaultConfig;

export default function prepareConfig() {
  validateConfig(config);
  return config;
}
