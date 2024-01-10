export const getTimeFromString = (
  val: string
): [number, number] | undefined => {
  const matches = val.match(/\b([01]?[0-9]|2[0-3])[:\-]([0-5][0-9])\b/);

  if (!matches?.length) {
    return;
  }

  const hours = parseInt(matches[1]);
  const minutes = parseInt(matches[2]);

  if (hours < 0 || hours > 24 || minutes < 0 || minutes > 60) {
    return;
  }

  return [hours, minutes];
};
