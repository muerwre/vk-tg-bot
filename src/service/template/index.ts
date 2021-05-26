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

const removeFrontmatter = () => (tree) => {
  tree.children = tree.children.filter((item) => item.type !== "yaml");
};

export class Template<
  F extends Record<string, any>,
  V extends Record<string, any>
> {
  public fields: F = {} as F;
  public template: string = "";

  constructor(filename: string) {
    try {
      if (!filename) {
        return;
      }

      const processor = unified()
        .use(stringify)
        .use(frontmatter)
        .use(extract, { yaml: parse })
        .use(removeFrontmatter)
        .use(parser)
        .use(strip);

      const file = toVFile.readSync(path.join(__dirname, "../../", filename));
      const result = processor.processSync(file);

      this.fields = result.data as F;
      this.template = result.contents.toString().trim();
    } catch (e) {
      throw new Error(`Template: ${e.toString()}`);
    }
  }

  /**
   * Themes the template with values
   */
  public theme = (values: V) => {
    return hb.compile(this.template)(values).replace(/\n+/g, "\n\n");
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
    const processor = unified()
      .use(stringify)
      .use(frontmatter)
      .use(extract, { yaml: parse })
      .use(removeFrontmatter)
      .use(parser)
      .use(strip);

    return processor.processSync(text).contents.toString();
  }
}

Template.registerHelpers();
