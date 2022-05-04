import { existsSync, writeFileSync, readFileSync } from 'fs'
import { join } from 'path'
import glob from 'fast-glob'
import merge from 'deepmerge'
import { createHash } from 'node:crypto'
import { cache, getProjectBasePath, log, removeDuplicatePaths } from './helper'
import { Options, Package } from './types'

// Default options.
const defaultOptions = (pkg: Package) => ({
  entry: [],
  output: 'dist',
  test: 'test',
  hash: createHash('md5').update(pkg.name).digest('hex').substring(0, 3),
  pkg,
})

export const options: () => Options = cache(() => {
  let packageContents: Package

  try {
    const packageContentsFile = readFileSync(join(getProjectBasePath(), 'package.json'), 'utf8')
    packageContents = JSON.parse(packageContentsFile)
  } catch (error) {
    log('Unable to load package.json', 'error')
  }

  if (typeof packageContents.name !== 'string') {
    log('Missing "name" field in package.json', 'error')
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
  result.entry = result.entry.filter((filePath) => existsSync(join(getProjectBasePath(), filePath)))

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
      glob.sync([`${result.test}/**.test.ts`], {
        cwd: getProjectBasePath(),
      }).length > 0
    result.test = hasTests ? result.test : false
  }

  return result
})
