'use strict'

import { readFileSync, readdirSync, writeFileSync } from 'fs'

// Get all markdown stubs
const header = readFileSync('documentor/header.md', 'utf-8')
const badges = readFileSync('documentor/badges.md', 'utf-8')
const installation = readFileSync('documentor/installation.md', 'utf-8')
const api = readFileSync('documentor/api.md', 'utf-8')
const strictnessAndComparisons = readFileSync('documentor/strictness_and_comparisons.md', 'utf-8')
const notImplemented = readFileSync('documentor/not_implemented.md', 'utf-8')
const contribute = readFileSync('documentor/contribute.md', 'utf-8')
const license = readFileSync('documentor/license.md', 'utf-8')
const sourceLink = (name, repo = 'h3ravel/collect.js') => `https://github.com/search?q=repo%3A${repo}%20${name}&type=code`

// Get all API docs
const methods = readdirSync('docs/api', 'utf-8')

// Build table of contents
const tableOfContents = methods.map((file) => {
  const methodName = file.replace('.md', '')

  return `- [${methodName}](#${methodName.toLowerCase()})`
}).join('\n')

// Build methods "readme"
const methodDocumentation = methods.map((file) => {
  let content = readFileSync(`docs/api/${file}`, 'utf-8')

  const lines = content.split('\n')

  lines[0] = `###${lines[0]}`
  lines.pop()
  lines.pop()

  content = lines.join('\n')
  content = content.replace(/(\r\n|\r|\n){2,}/g, '$1\n')
  content = content.replace(/\[View source on GitHub\]\([^)]+\)/g, '')

  return content
}).join('\n\n')

writeFileSync(
  'README.md',
  [
    header,
    badges,
    installation,
    api,
    tableOfContents,
    strictnessAndComparisons,
    notImplemented,
    methodDocumentation,
    contribute,
    license,
  ].join('\n\n'),
)

methods.map((file) => {
  let content = readFileSync(`docs/api/${file}`, 'utf-8')

  content = content.replace(
    /\[View source on GitHub\]\([^)]+\)/g,
    `[View source on GitHub](${sourceLink(file.replace('.md', ''))})`
  )

  writeFileSync(`docs/api/${file}`, content)
})