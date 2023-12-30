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
import transformMDLinks from "../../utils/transformMDLinks";

const removeFrontmatter = () => (tree) => {
  tree.children = tree.children.filter((item) => item.type !== "yaml");
};

export class Template<
  Fields extends Record<string, any>,
  Values extends Record<string, any>
> {
  public fields: Fields = {} as Fields;
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
      this.fields = result.data as Fields;
    } catch (e) {
      throw new Error(`Template: ${e?.toString()}`);
    }
  }

  /**
   * Themes the template with values, removes markdown from template.
   * NOTE: text, that we'll insert into template, won't be used here
   */
  public theme = (values: Values, markdown?: boolean) => {
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

  /** Cleans text from markdown, but transforms links to MD if needed */
  public static cleanText(text: string, markdown?: boolean) {
    const processor = unified().use(stringify).use(parser).use(strip);

    const output = processor.processSync(text).contents.toString();

    if (markdown) {
      return transformMDLinks(output);
    }

    return output;
  }
}

Template.registerHelpers();
