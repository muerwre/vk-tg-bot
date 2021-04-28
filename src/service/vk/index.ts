import { VkConfig } from "./types";

export class VkService {
  public endpoint: string = "/";

  constructor(private config: VkConfig) {
    if (!config.groups.length) {
      throw new Error("No vk groups to handle. Specify them in config");
    }

    this.endpoint = config.endpoint;
  }

  /**
   * Handles incoming VK events
   */
  public handle = async (event: any) => {
    // TODO: handle events
  };
}
