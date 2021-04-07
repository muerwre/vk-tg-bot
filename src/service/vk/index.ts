import { VkConfig } from './types';

export class VkService {
  constructor(private config: VkConfig) {
    if (!config.groups.length) {
      throw new Error('No vk groups to handle. Specify them in config')
    }
  }
}
