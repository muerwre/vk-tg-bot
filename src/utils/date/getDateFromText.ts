import { addYears, differenceInMonths, isBefore } from "date-fns";
import { getDayMonthFromText, getTimeFromString } from "./getDayMonthFromText";

export const getDateFromText = (
  val: string,
  createdAt: Date
): Date | undefined => {
  const text = val.toLowerCase();

  const dayMonth = getDayMonthFromText(text, createdAt);
  if (!dayMonth) {
    return;
  }

  const time = getTimeFromString(text);
  if (!time) {
    return;
  }

  const date = new Date(
    createdAt.getFullYear(),
    dayMonth[1],
    dayMonth[0],
    time[0],
    time[1]
  );

  // handle posts written in november-december for next year's january-february
  if (isBefore(date, createdAt) && differenceInMonths(addYears(date, 1), createdAt) < 5) {
    return addYears(date, 1);
  }

  return date;
};
