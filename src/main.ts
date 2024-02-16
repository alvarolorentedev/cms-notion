const { Client } = require('@notionhq/client')
const { NotionToMarkdown } = require('notion-to-md')
const core = require('@actions/core')
const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const propertyMapper = async (value: any) => {
  if (value.type === 'title') return value.title[0]?.text.content
  if (value.type === 'number') return value.number
  if (value.type === 'email') return value.email
  if (value.type === 'url') return value.url
  if (value.type === 'select') return value.select?.name
  if (value.type === 'files') {
    const file = value.files[0]
    if (!file) return
    if (file.type === 'file') return file.file.url
    if (file.type === 'external') return file.external.url
  }
  if (value.type === 'status') return value.status?.name
  if (value.type === 'date') return new Date(value.date?.start)
  if (value.type === 'created_time') return new Date(value.created_time)
  if (value.type === 'checkbox') return value.checkbox
  if (value.type === 'multi_select')
    return value.multi_select.map((multi: any) => multi.name)
  if (
    value.type === 'created_by' ||
    value.type === 'people' ||
    value.type === 'last_edited_by'
  )
    return undefined
  return JSON.stringify(value)
}

function fillTemplate(template: any, data: any) {
  return template.replace(/{(\w+)}/g, (match: any, key: any) => data[key] || '')
}

export async function run() {
  const notion = new Client({
    auth: core.getInput('notion-api-key', { required: true })
  })
  const posts = await notion.databases.query({
    filter: {
      and: [
        {
          property: core.getInput('property-release-date', { required: true }),
          date: {
            on_or_before: new Date().toISOString()
          }
        },
        {
          property: core.getInput('property-draft', { required: true }),
          checkbox: {
            equals: false
          }
        }
      ]
    },
    database_id: core.getInput('notion-database-id', { required: true })
  })
  const n2m = new NotionToMarkdown({ notionClient: notion })
  await Promise.all(
    posts.results.map(async (post: any) => {
      const mdblocks = await n2m.pageToMarkdown(post.id)
      const mdString = n2m.toMarkdownString(mdblocks)
      const propEntries = Object.fromEntries(
        (
          await Promise.all(
            Object.entries(post.properties || []).map(async ([name, value]) => [
              name,
              await propertyMapper(value)
            ])
          )
        ).filter(([_, value]) => value)
      )
      const yamlFrontMatter = yaml.dump(propEntries)
      const frontMatterDelimiter = core.getInput('front-matter-delimiter', {
        required: true
      })
      const content = `${frontMatterDelimiter}\n${yamlFrontMatter}${frontMatterDelimiter}\n${mdString.parent}`
      console.log(content)
      const destinationFolder = core.getInput('destination-folder', {
        required: true
      })
      const fileNameFormat = core.getInput('file-name-format', {
        required: true
      })
      const destinationFilePath = path.join(
        process.env.GITHUB_WORKSPACE,
        destinationFolder,
        `${fillTemplate(fileNameFormat, propEntries)}.md`
      )
      console.log(`creating: ${destinationFilePath}`)
      fs.writeFileSync(destinationFilePath, content)
    })
  )
}
