const urlRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g;

const trimTo = (val: string, maxLength: number) =>
  val.length > maxLength ? val.substring(0, maxLength - 1).concat("…") : val;

/** Formatting all links in markdown output, trimming them to reasonable length */
export default (value: string) =>
  value.replace(urlRegex, (val) => {
    return `[${trimTo(val, 20)}](${val})`;
  });
