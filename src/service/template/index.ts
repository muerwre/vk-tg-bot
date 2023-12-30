import extract from "remark-extract-frontmatter";
import frontmatter from "remark-frontmatter";
import stringify from "remark-stringify";
import parser from "remark-parse";
import unified from "unified";
import { parse } from "yaml";
import toVFile from "to-vfile";
import path from "path";
import hb from "handlebars";
import strip from "strip-markdown";
import { VFileCompatible } from "vfile";

const removeFrontmatter = () => (tree) => {
  tree.children = tree.children.filter((item) => item.type !== "yaml");
};

export class Template<
  F extends Record<string, any>,
  V extends Record<string, any>
> {
  public fields: F = {} as F;
  public template: string = "";

  private readonly file: VFileCompatible = "";

  constructor(filename: string) {
    try {
      if (!filename) {
        return;
      }

      // read file and fields from it to this.fields

      const processor = unified()
        .use(stringify)
        .use(frontmatter)
        .use(extract, { yaml: parse })
        .use(removeFrontmatter)
        .use(parser);

      const dir =
        process.env.NODE_ENV === "development" ? "../../../" : "../../";

      this.file = toVFile.readSync(path.join(__dirname, dir, filename));
      const result = processor.processSync(this.file);
      this.fields = result.data as F;
    } catch (e) {
      throw new Error(`Template: ${e?.toString()}`);
    }
  }

  /**
   * Themes the template with values
   */
  public theme = (values: V, markdown?: boolean) => {
    const processor = unified()
      .use(stringify)
      .use(frontmatter)
      .use(removeFrontmatter)
      .use(parser);

    if (!markdown) {
      processor.use(strip);
    }

    const result = processor.processSync(this.file);
    const template = result.contents.toString().trim();

    return hb
      .compile(template)(values)
      .replace(/\n{2,}/g, "\n\n");
  };

  /**
   * Registers handlebars helpers
   */
  public static registerHelpers() {
    hb.registerHelper("ifEq", function (arg1, arg2, options) {
      // @ts-ignore
      return arg1 == arg2 ? options.fn(this) : options.inverse(this);
    });
  }

  public static cleanText(text: string) {
    return unified()
      .use(stringify)
      .use(parser)
      .use(strip)
      .processSync(text)
      .contents.toString();
  }
}

Template.registerHelpers();
