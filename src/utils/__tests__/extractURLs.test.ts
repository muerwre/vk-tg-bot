import { extractURLs } from "../extract";

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
});
