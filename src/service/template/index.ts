import extract from "remark-extract-frontmatter";
import frontmatter from "remark-frontmatter";
import compiler from "remark-stringify";
import parser from "remark-parse";
import unified from "unified";
import { parse } from "yaml";
import toVFile from "to-vfile";
import path from "path";
import hb from "handlebars";

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
        .use(parser)
        .use(compiler)
        .use(frontmatter)
        .use(extract, { yaml: parse });

      const file = toVFile.readSync(path.join(__dirname, "../../", filename));
      const result = processor.processSync(file);

      this.fields = result.data as F;
      this.template = result
        .toString()
        .replace(/^---\n(.*)---\n?$/gms, "")
        .trim();
    } catch (e) {
      throw new Error(`Template: ${e.toString()}`);
    }
  }

  theme = (values: V) => {
    return hb.compile(this.template)(values);
  };
}
