import { getDayMonthFromText } from "./getDayMonthFromText";
import { getTimeFromString } from "./getTimeFromString";

export const getDateFromText = (
  val: string,
  createdAt: Date
): Date | undefined => {
  const text = val.toLowerCase();

  const time = getTimeFromString(text);
  if (!time) {
    return;
  }

  const dayMonth = getDayMonthFromText(text, createdAt);
  if (!dayMonth) {
    return;
  }

  const date = new Date(
    createdAt.getFullYear(),
    dayMonth[1],
    dayMonth[0],
    time[0],
    time[1]
  );

  // TODO: handle jan and feb posts from december or november
  // if createdAt is december and date is in January or February
  // like this:
  // if (isBefore(date, createdAt) && differenceInMonths(addYears(date, 1), createdAt) < 3) {
  //   return addYears(date, 1) 
  // }
  // if (isBefore(date, createdAt)) {
  //   const diff = differenceInMonths(date, createdAt);
  //   return diff > 9 && dayMonth[1] >= 10
  //     ? addYears(date, 1)
  //     : undefined;
  // }

  return date;
};
