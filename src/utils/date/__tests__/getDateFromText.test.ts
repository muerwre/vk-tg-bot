import { format, parse } from "date-fns";
import { getDateFromText } from "../getDateFromText";


interface Case {
  text: string,
  created: string,
  date: string,
}

describe("getDateFromText", () => {
  const real: Case[] = require('./getDateFromText.real.json');
  const synthetic: Case[] = require('./getDateFromText.synthetic.json');

  it.each(real)("(real case) $text", ({ text, created, date }) => {
    const createdDate = parse(created, "yyyy-MM-dd HH:mm:ss", new Date());
    const result = getDateFromText(text, createdDate);

    expect(result ? format(result, "yyyy-MM-dd HH:mm:ss") : "").toBe(date);
  });

  it.each(synthetic)("(synthetic case) $text", ({ text, created, date }) => {
    const createdDate = parse(created, "yyyy-MM-dd HH:mm:ss", new Date());
    const result = getDateFromText(text, createdDate);

    expect(result ? format(result, "yyyy-MM-dd HH:mm:ss") : "").toBe(date);
  });
});
