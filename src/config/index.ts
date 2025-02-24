import yaml from "js-yaml";
import fs from "fs";
import path from "path";
import { Config } from "./types";
import { validateConfig } from "./validate";
import { getCmdArg } from "../utils/args";
import { defaultConfig } from "./default";
import { merge } from "lodash";
import {
  CalendarKeyFile,
  calendarKeyValidator,
} from "../service/calendar/config";

const configPath = getCmdArg("config");
const data = fs.readFileSync(
  configPath || path.join(__dirname, "../config.yml"),
  "utf8"
);

const userConfig = yaml.load<Config>(data);

const config =
  (userConfig && merge(defaultConfig, userConfig)) || defaultConfig;

export default function prepareConfig() {
  validateConfig(config);

  if (config.calendar?.keyFile) {
    try {
      const key = JSON.parse(
        fs.readFileSync(config.calendar?.keyFile).toString()
      ) as CalendarKeyFile;

      if (key) {
        calendarKeyValidator.validateSync(key);
        config.calendarKey = key;
      }
    } catch (error) {
      console.warn("tried to parse calendar key, got error", error);
    }
  }

  config.telegram.templates = {
    help: config.templates.help,
    help_admin: config.templates.help_admin,
  };

  return config;
}
