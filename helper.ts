import { join } from 'path'
import { create } from 'logua'

export const log = create('squak', 'red')

const results = new Map()

// Cache the result of a function with separate method to clear between test runs.
// Only for methods that accept no arguments, but read from the filesystem, which
// isn't expected to change until refresh is called.
export const cache =
  <T>(method: () => T) =>
  () => {
    if (results.has(method)) {
      return results.get(method)
    }
    const result = method()

    results.set(method, result)

    return result
  }

export const clearCache = () => results.clear()

export const getProjectBasePath = () => {
  // CWD during postinstall is in package, otherwise in project.
  const currentWorkingDirectory = process.cwd()

  if (currentWorkingDirectory.includes('node_modules/squak')) {
    return join(currentWorkingDirectory, '../..')
  }

  return currentWorkingDirectory
}

export const configurationPath = () => {
  if (typeof jest !== 'undefined') {
    return './../../../configuration'
  }

  return './node_modules/squak/configuration'
}

export const removeDuplicatePaths = (relativePaths: string[]) => {
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
