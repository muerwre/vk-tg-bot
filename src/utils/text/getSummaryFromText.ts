/** Makes summary from first 3 strings of text */
export const getSummaryFromText = (text: string) => {
  const match = text.match(/(.*\n?){0,3}/)

  return match?.[0] ?? '';
}
