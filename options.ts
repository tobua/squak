import { existsSync, writeFileSync, readFileSync } from 'fs'
import { join } from 'path'
import { sync as syncGlob } from 'fast-glob'
import merge from 'deepmerge'
import { cache, getProjectBasePath, log } from './helper'
import { Options } from './types'

const removeDuplicatePaths = (relativePaths: string[]) => {
  // Checking the absolute paths for duplicates, so that './index.ts' and 'index.ts'
  // count as duplicates.
  const absolutePaths = relativePaths.map((path) =>
    join(getProjectBasePath(), path)
  )
  const noDuplicatesSet = new Set()

  const indicesToRemove = []

  absolutePaths.forEach((path, index) => {
    if (noDuplicatesSet.has(path)) {
      indicesToRemove.push(index)
    }

    noDuplicatesSet.add(path)
  })

  // Remove biggest indices first, as otherwise indices change.
  indicesToRemove.reverse()

  indicesToRemove.forEach((index) => {
    // Remove duplicate path in-place from relativePaths.
    relativePaths.splice(index, 1)
  })

  return relativePaths
}

// Default options.
const defaultOptions = (pkg: Object) => ({
  entry: [],
  output: 'dist',
  test: 'test',
  pkg,
})

export const options = cache(() => {
  let packageContents: { squak?: Object }

  try {
    const packageContentsFile = readFileSync(
      join(getProjectBasePath(), 'package.json'),
      'utf8'
    )
    packageContents = JSON.parse(packageContentsFile)
  } catch (error) {
    log('unable to load package.json', 'error')
  }

  let result: Options = defaultOptions(packageContents)

  if (typeof packageContents.squak === 'object') {
    // Include project specific overrides
    result = merge(result, packageContents.squak, { clone: false })

    if (typeof result.entry === 'string') {
      result.entry = [result.entry]
    }
  }

  // Add default entries.
  result.entry = result.entry.concat(['index.ts', 'src/index.ts'])

  // Remove non-existing files.
  result.entry = result.entry.filter((filePath) =>
    existsSync(join(getProjectBasePath(), filePath))
  )

  if (result.entry.length === 0) {
    const entryFilePath = join(getProjectBasePath(), 'index.ts')
    writeFileSync(entryFilePath, '// Default entry file created by squak.')
    log(`No entry file found, created one in ${entryFilePath}`)
    result.entry = ['index.ts']
  }

  result.entry = removeDuplicatePaths(result.entry)

  // Unless overriden with boolean by user, we'll only look for tests in one folder.
  if (typeof result.test === 'string') {
    const hasTests =
      syncGlob([`${result.test}/**.test.ts`], {
        cwd: getProjectBasePath(),
      }).length > 0
    result.test = hasTests ? result.test : false
  }

  return result
})
