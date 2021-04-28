import extract from "remark-extract-frontmatter";
import frontmatter from "remark-frontmatter";
import compiler from "remark-stringify";
import parser from "remark-parse";
import unified from "unified";
import { parse } from "yaml";
import toVFile from "to-vfile";
import path from "path";

export class Template<T extends Record<string, any>> {
  public fields: T = {} as T;
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

      this.fields = result.data as T;
      this.template = result
        .toString()
        .replace(/^---\n(.*)---\n?$/gms, "")
        .trim();
    } catch (e) {
      throw new Error(`Template: ${e.toString()}`);
    }
  }
}
