import yaml from 'js-yaml'
import fs from 'fs'
import path from 'path';
import { Config } from './types';
import { mergeRight } from 'ramda';
import { validateConfig } from './validate';
import logger from '../service/logger';

const defaultConfig = yaml.load<Config>(fs.readFileSync(path.join(__dirname, '../config.example.yml'), 'utf8'));
const userConfig = yaml.load<Config>(fs.readFileSync(path.join(__dirname, '../config.yml'), 'utf8'));

const config = userConfig && mergeRight(defaultConfig, userConfig) || defaultConfig

export default function prepareConfig() {
  validateConfig(config)
  logger.debug('config is ok:', config)
  return config
}
