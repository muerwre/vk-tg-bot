import { PhotoAttachment } from "vk-io";

export const getAttachment = (img: PhotoAttachment): string | undefined => {
  try {
    return img.mediumSizeUrl;
  } catch (e) {
    return undefined;
  }
};
