import { URL } from "url";

const urlRe = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s\]]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s\]]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s\]]{2,}|www\.[a-zA-Z0-9]+\.[^\s\]]{2,})/gim;

export const extractURLs = (text: string): URL[] => {
  const matches = text.match(urlRe) || [];

  return matches
    .map((m) => {
      try {
        return new URL(m);
      } catch (e) {
        return;
      }
    })
    .filter((el) => el) as URL[];
};
