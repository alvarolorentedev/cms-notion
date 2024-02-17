# Notion CMS

Use this Github Action to use notion as a CMS. :rocket:

## Usage

Here's an example of how to use this action in a workflow file:

```yaml
name: Example Workflow

on:
  workflow_dispatch:

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      #use this action
      - uses: alvarolorentedev/notion-cms@main
        with:
          notion-api-key: ${{ secrets.NOTION_API_KEY }}
          notion-database-id: ${{ secrets.NOTION_DATABASE_ID }}
      # Recommended: commit changes
      - uses: EndBug/add-and-commit@v9
        with:
          default_author: github_actions
          message: '[skip ci] Moved scheduled articles'
        
```

## Inputs

| Input          | Default | Description                     |
| -------------- | ------- | ------------------------------- |
| `destination-folder` | `./blog` | the folder for the publised articles |
| `property-release-date` | `published` | the name of the property that refers to when the article will be published |
| `property-draft` | `draft` | the name of the property that refers if an article is still in draft mode |
| `front-matter-delimiter` | `---` | the delimiter characters for front matter in markdown files |
| `file-name-format` | `{published}-{title}` | the name format of the file to write |
| `notion-api-key` | undefined | the notion api key |
| `notion-database-id` | undefined | the notion database id that is going to work as CMS |


