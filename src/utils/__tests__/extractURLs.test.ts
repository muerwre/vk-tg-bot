import { extractURLs } from "../links";

describe("extractURLs", () => {
  it("extracts simple urls", () => {
    const result = extractURLs(
      "Trying out links https://map.vault48.org/test 123"
    );

    expect(result.length).toBe(1);
    expect(result[0].href).toBe("https://map.vault48.org/test");
  });

  it("works with that weird new VK urls", () => {
    const result = extractURLs(
      "Trying out links: [#alias|map.vault48.org/test|https://map.vault48.org/test]"
    );

    expect(result.length).toBe(1);
    expect(result[0].href).toBe("https://map.vault48.org/test");
  });

  it("works with that weird new VK urls without scheme", () => {
    const result = extractURLs(
      "Trying out links: [#alias|map.vault48.org/test|map.vault48.org/test]"
    );

    expect(result.length).toBe(1);
    expect(result[0].href).toBe("https://map.vault48.org/test");
  });

  it("works with that weird new VK urls without scheme (with backslash)", () => {
    const result = extractURLs(
      "Trying out links: \\[#alias|map.vault48.org/test|map.vault48.org/test]"
    );

    expect(result.length).toBe(1);
    expect(result[0].href).toBe("https://map.vault48.org/test");
  });

  it("deduplicates matching urls", () => {
    const result = extractURLs(
      `Trying out links: [#alias|map.vault48.org/test|map.vault48.org/test] map.vault48.org/test https://map.vault48.org/test map.vault48.org/test2 https://map.vault48.org/test3
      [#alias|map.vault48.org/test2|map.vault48.org/test2] [#alias|map.vault48.org/test3|map.vault48.org/test3] [#alias|map.vault48.org/test4|map.vault48.org/test4] https://map.vault48.org/test5
      `
    ).map((it) => it.href);

    expect(result).toEqual([
      "https://map.vault48.org/test",
      "https://map.vault48.org/test2",
      "https://map.vault48.org/test3",
      "https://map.vault48.org/test4",
      "https://map.vault48.org/test5",
    ]);
  });

  it("skipps link description", () => {
    const result = extractURLs(
      `Trying out links: [#alias|map.vault48.org/test3|https://map.vault48.org/test] https://map.vault48.org/test2`
    ).map((it) => it.href);

    expect(result).toEqual([
      "https://map.vault48.org/test",
      "https://map.vault48.org/test2",
    ]);
  });
});
