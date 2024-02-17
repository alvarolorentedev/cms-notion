import { TransformPost } from "./models/post/TransformPost"
import { getPosts } from "./models/post/getPosts"

const { Client } = require('@notionhq/client')
const core = require('@actions/core')
const fs = require('fs')
const path = require('path')

function fillTemplate(template: any, data: any) {
  return template.replace(/{(\w+)}/g, (match: any, key: any) => data[key] || '')
}

export async function run() {
  const notion = new Client({
    auth: core.getInput('notion-api-key', { required: true })
  })
  const posts = await getPosts(notion)
  await Promise.all(
    posts.results.map(async (post: any) => {
      const { propEntries, content } = await TransformPost(notion, post)
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
