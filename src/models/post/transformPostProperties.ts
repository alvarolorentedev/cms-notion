const casesDirectType = ['number', 'email', 'url', 'checkbox', 'created_time']
const casesTextType = ['title', 'rich_text']
const casesNamedType = ['select', 'status']

const mapperStrategies = [
  {
    shouldRun: (value: any) => casesDirectType.includes(value.type),
    run : (value: any) => value[value.type]
  },
  {
    shouldRun: (value: any) => casesTextType.includes(value.type),
    run : (value: any) => value[value.type][0]?.text.content
  },
  {
    shouldRun: (value: any) => casesNamedType.includes(value.type),
    run : (value: any) => value[value.type]?.name
  },
  {
    shouldRun: (value: any) => value.type === 'date',
    run : (value: any) => new Date(value.date?.start).toISOString()
  },
  {
    shouldRun: (value: any) => value.type === 'multi_select',
    run : (value: any) => value.multi_select.map((multi: any) => multi.name)
  },
  {
    shouldRun: (value: any) => value.type === 'files',
    run : (value: any) => {
      const file = value.files[0]
      if (!file) return
      if (file.type === 'file') return file.file.url
      if (file.type === 'external') return file.external.url
    }
  }
]


export async function transformPostProperties(post: any) {
  return Object.fromEntries(
    (
      await Promise.all(
        Object.entries(post.properties || []).map(async ([name, value]) => [
          name,
          await mapperStrategies.find(strategy => strategy.shouldRun(value))?.run(value)
        ])
      )
    ).filter(([_, value]) => value)
  );
}
