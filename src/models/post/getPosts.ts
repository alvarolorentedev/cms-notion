const core = require('@actions/core');

export async function getPosts(notion: any) {
  return await notion.databases.query({
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
  });
}
