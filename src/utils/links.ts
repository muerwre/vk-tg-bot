import { URL } from "url";

const simpleUrlRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s\]]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s\]]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s\]]{2,}|www\.[a-zA-Z0-9]+\.[^\s\]]{2,})/gim;
const weirdLongUrlRegex = /\[(.*)\|(.*)\|(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s\]]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s\]]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s\]]{2,}|www\.[a-zA-Z0-9]+\.[^\s\]]{2,})\]/g;

/** Extracts URLs from text */
export const extractURLs = (text: string): URL[] => {
  const matches = text.match(simpleUrlRegex) || [];

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

/** Adds ... to text if its length exceeds maxLength */
const trimTo = (val: string, maxLength: number) =>
  val.length > maxLength ? val.substring(0, maxLength - 1).concat("…") : val;

/** Formatting all links in markdown output, trimming them to reasonable length */
export const transformMDLinks = (value: string) =>
  value
    .replace(weirdLongUrlRegex, (val, ...args) => {
      if (args.length < 2) {
        return val;
      }

      return `[${trimTo(args[1], 20)}](${args[2]})`;
    })
    .replace(simpleUrlRegex, (val) => {
      if (val.endsWith(")")) {
        return val;
      }

      return `[${trimTo(val, 20)}](${val})`;
    });
