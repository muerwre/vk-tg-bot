import extract from "remark-extract-frontmatter";
import frontmatter from "remark-frontmatter";
import compiler from "retext-stringify";
import parser from "remark-parse";
import unified from "unified";
import { parse } from "yaml";
import toVFile from "to-vfile";
import path from "path";
import hb from "handlebars";

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
        .use(compiler)
        .use(frontmatter)
        .use(extract, { yaml: parse })
        .use(removeFrontmatter)
        .use(parser);

      const file = toVFile.readSync(path.join(__dirname, "../../", filename));
      const result = processor.processSync(file);

      this.fields = result.data as F;
      this.template = result.contents.toString().trim();
    } catch (e) {
      throw new Error(`Template: ${e.toString()}`);
    }
  }

  /**
   * Themes the tempalte with values
   */
  public theme = (values: V) => {
    return hb.compile(this.template)(values);
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
}

Template.registerHelpers();
