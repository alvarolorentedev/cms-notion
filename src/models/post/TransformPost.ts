import { transformPostProperties } from "./transformPostProperties";
const { NotionToMarkdown } = require('notion-to-md');
const core = require('@actions/core');
const yaml = require('js-yaml');

export async function TransformPost(notionClient: any, post: any) {
  const n2m = new NotionToMarkdown({ notionClient });
  const mdblocks = await n2m.pageToMarkdown(post.id);
  const mdString = n2m.toMarkdownString(mdblocks);
  const propEntries = await transformPostProperties(post);
  const yamlFrontMatter = yaml.dump(propEntries);
  const frontMatterDelimiter = core.getInput('front-matter-delimiter', {
    required: true
  });
  const content = `${frontMatterDelimiter}\n${yamlFrontMatter}${frontMatterDelimiter}\n${mdString.parent}`;
  return { propEntries, content };
}
