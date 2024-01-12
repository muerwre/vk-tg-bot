import { addDays, differenceInDays, startOfISOWeek } from "date-fns";

const months = [
  "янв",
  "фев",
  "мар",
  "апр",
  "мая",
  "июн",
  "июл",
  "авг",
  "сен",
  "окт",
  "нояб",
  "дек",
];

const daysOfWeek = [
  "понед",
  "втор",
  "сред",
  "четв",
  "пятниц",
  "субб",
  "воскр",
];

type DayMonth = [number, number];

/** Searches for strings like 1 января */
const byText = (val: string): DayMonth | undefined => {
  const text = val.toLowerCase();

  // matches "12-22 мая" or "12 - 22 мая"
  const matchWithDash = text.match(new RegExp(`([1-2][0-9]|0?[1-9]|3[0-1])(?:(?: - |-| – |–)\\d{1,2}) (${months.join("|")})`));
  // matches 12 мая, 12-го мая
  const rer = new RegExp(`([1-2][0-9]|0?[1-9]|3[0-1])[\\-\\–A-Za-zА-Яа-яЁё ]{1,4}(${months.join("|")})`);
  const match = text.match(rer);

  if (!match?.length && !matchWithDash?.length) {
    return;
  }

  const day = parseInt(matchWithDash?.[1] ?? match?.[1] ?? '');
  const month = months.indexOf(matchWithDash?.[2] ?? match?.[2] ?? '');

  if (
    !Number.isFinite(day) ||
    !Number.isFinite(month) ||
    day < 1 ||
    day > 31 ||
    month < 0 ||
    month > months.length - 1
  ) {
    return;
  }

  return [day, month];
};

const byNumber = (val: string): DayMonth | undefined => {
  const text = val.toLowerCase();

  const match = text.match(/(?<![\.|\d|\w])(0?[1-9]|[1-2][0-9]|3[0-1])\.(1[0-2]|0[1-9])/);
  if (!match?.length) {
    return;
  }

  const day = parseInt(match[1]);
  const month = parseInt(match[2]) - 1;
  if (
    !Number.isFinite(day) ||
    !Number.isFinite(month) ||
    day < 1 ||
    day > 31 ||
    month < 0 ||
    month > 11
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

  if (text.match(/послезавтра/)) {
    const tomorrow = addDays(refDate, 2);
    return [tomorrow.getDate(), tomorrow.getMonth()];
  }

  return;
};

const byDayOfWeek = (val: string, refDate: Date): DayMonth | undefined => {
  const text = val.toLowerCase();
  const regexp = new RegExp(`(${daysOfWeek.join("|")})`);
  const match = text.match(regexp);
  if (!match?.length) {
    return;
  }

  const dayOfWeek = daysOfWeek.indexOf(match[1]);
  if (dayOfWeek < 0) {
    return;
  }

  const refDayOfWeek = differenceInDays(refDate, startOfISOWeek(refDate));
  const distanceFromCreatedAt = dayOfWeek > refDayOfWeek
    ? (dayOfWeek - refDayOfWeek)
    : (7 - (refDayOfWeek - dayOfWeek)); // turn to next week

  const date = addDays(refDate, distanceFromCreatedAt);
  return [
    date.getDate(),
    date.getMonth()
  ]
};

/** Note: months start with 0, days start with 1 */
export const getDayMonthFromText = (val: string, refDate: Date) =>
  byText(val) ?? byNumber(val) ?? byToday(val, refDate) ?? byDayOfWeek(val, refDate);

export const getTimeFromString = (
  val: string
): [number, number] | undefined => {
  // 16:45
  const matches = val.match(/(?<![\.|\d|\w])([01]?[0-9]|2[0-3])\:([0-5][0-9])(?![\d|\w])/);

  // 16-45
  const dashRegexp = new RegExp(`(?<![\\.\\d\\wа-яА-ЯЁё])([01]?[0-9]|2[0-3])[\\-\\–]([0-5][0-9])(?![\\d\\wа-яА-ЯЁё]|(?: (?:${months.join("|")})))`);
  const dashMatches = val.match(dashRegexp);

  // some people specify time as 19.45, it's weird, but let's try to parse it
  const dotMatches = val.match(/(?<![\.|\d|\w])([1-9]|[1|2][0-9])\.(1[3-9]|[2-5][0-9])(?![\d|\.|\w])/);

  if (!matches?.length && !dotMatches?.length && !dashMatches?.length) {
    return;
  }

  const hours = parseInt(matches?.[1] ?? dashMatches?.[1] ?? dotMatches?.[1] ?? '');
  const minutes = parseInt(matches?.[2] ?? dashMatches?.[2] ?? dotMatches?.[2] ?? '');

  if (hours < 0 || hours > 24 || minutes < 0 || minutes > 60) {
    return;
  }

  return [hours, minutes];
};
