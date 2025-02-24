import { URL } from "url";

const simpleUrlRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s\]]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s\]]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s\]]{2,}|www\.[a-zA-Z0-9]+\.[^\s\]]{2,})/gim;

/** Yep, that's how VK posts it's links */
const weirdLongUrlRegex = /(\\?)\[\#alias\|([^\|]+)\|([^\]]+)\]/gim;

const fixUrl = (url: string) =>
  url.startsWith("http") || !url ? url : `https://${url}`;

/** Extracts URLs from text */
export const extractURLs = (text: string): URL[] => {
  const urls = new Set<string>();

  text
    .match(weirdLongUrlRegex)
    ?.forEach((match) =>
      urls.add(fixUrl(match.replace(weirdLongUrlRegex, "$2")))
    );

  text.match(simpleUrlRegex)?.forEach((match) => urls.add(match));

  return Array.from(urls)
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
      if (args.length < 3) {
        return val;
      }

      const title = trimTo(args[1] ?? args[2], 20);
      const url = fixUrl(args[2]);

      return `[${title}](${url})`;
    })
    .replace(simpleUrlRegex, (val) => {
      if (val.endsWith(")")) {
        return val;
      }

      return `[${trimTo(val, 20)}](${val})`;
    });
