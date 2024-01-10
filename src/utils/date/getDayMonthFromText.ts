import { addDays } from "date-fns";

const months = [
  "янв",
  "фев",
  "мар",
  "апр",
  "мая",
  "июн",
  "июл",
  "авг",
  "сент",
  "октя",
  "нояб",
];

type DayMonth = [number, number];

/** Searches for strings like 1 января */
const byText = (val: string): DayMonth | undefined => {
  const text = val.toLowerCase();
  const match = text.match(
    /(\d{1,2})\s?(янв|фев|мар|апр|мая|июн|июл|авг|сент|октя|нояб).*/
  );

  if (!match?.length) {
    return;
  }

  const day = parseInt(match[1]);
  const month = months.indexOf(match[2]);

  if (
    !Number.isFinite(day) ||
    !Number.isFinite(month) ||
    day < 0 ||
    day > 31 ||
    month < 0 ||
    month >= months.length
  ) {
    return;
  }

  return [day, month];
};

const byNumber = (val: string): DayMonth | undefined => {
  const text = val.toLowerCase();

  const match = text.match(/\b([0-2]?[0-9]|31)\.([1]?[0-2]|0?[0-9])\b/);
  if (!match?.length) {
    return;
  }

  const day = parseInt(match[1]);
  const month = parseInt(match[2]);
  if (
    !Number.isFinite(day) ||
    !Number.isFinite(month) ||
    day < 1 ||
    day > 31 ||
    month < 1 ||
    month > 12
  ) {
    return;
  }

  return [day, month];
};

const byToday = (val: string, refDate: Date): DayMonth | undefined => {
  const text = val.toLowerCase();
  if (text.match(/сегодня/)) {
    return [refDate.getDate(), refDate.getMonth()];
  }

  if (text.match(/завтра/)) {
    const tomorrow = addDays(refDate, 1);
    return [tomorrow.getDate(), tomorrow.getMonth()];
  }

  return;
};
export const getDayMonthFromText = (val: string, refDate: Date) =>
  byText(val) || byNumber(val) || byToday(val, refDate);
