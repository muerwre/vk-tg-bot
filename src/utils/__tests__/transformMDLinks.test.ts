import { transformMDLinks } from "../links";

describe("transformMDLinks", () => {
  it("extracts simple urls", () => {
    expect(
      transformMDLinks("Trying out links https://map.vault48.org/test 123")
    ).toBe(
      "Trying out links [https://map.vault48…](https://map.vault48.org/test) 123"
    );
  });

  it("works with that weird new VK urls", () => {
    expect(
      transformMDLinks(
        "Trying out links [#alias|12345678901234567890123|https://map.vault48.org/test_abc_def_ghi] 123"
      )
    ).toBe(
      "Trying out links [1234567890123456789…](https://map.vault48.org/test_abc_def_ghi) 123"
    );

    expect(
      transformMDLinks(
        "Trying out links [#alias|12345678901234567890123|map.vault48.org/test_abc_def_ghi] 123"
      )
    ).toBe(
      "Trying out links [1234567890123456789…](https://map.vault48.org/test_abc_def_ghi) 123"
    );

    expect(
      transformMDLinks(
        "Trying out links \\[#alias|12345678901234567890123|map.vault48.org/test_abc_def_ghi] 123"
      )
    ).toBe(
      "Trying out links [1234567890123456789…](https://map.vault48.org/test_abc_def_ghi) 123"
    );
  });
});
