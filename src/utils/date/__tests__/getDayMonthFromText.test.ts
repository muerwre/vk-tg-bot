import { getDayMonthFromText } from "../getDayMonthFromText";

describe("getDayMonthFromText", () => {
  const cases = [
    {
      text:
        "Попытка номер два.\n\nСегодня. Старт в 19:32 от ГПНТБ. 80км. Асфальт. Темп бодрый. Две остановки на поесть и передохнуть. Маршрут тот же. Автоматическая отмена поката при граде размером более 0.5см.\n\nhttps://map.vault48.org/04092023_razmyatsya_po_asfaltu",
      created: new Date("2023-09-06T04:24:53.000Z"),
      expected: [6, 8],
    },
  ];

  it.each(cases)("$text", ({ text, created, expected }) => {
    expect(getDayMonthFromText(text, created)).toEqual(expected);
  });
});
