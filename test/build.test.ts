import { test, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  registerVitest,
  prepare,
  environment,
  packageJson,
  file,
  contentsForFilesMatching,
  writeFile,
  wait,
} from 'jest-fixture'
import { configure } from '../configure'
import { build } from '../script/build'
import { clearCache } from '../helper'

registerVitest(beforeEach, afterEach, vi)

environment('build')

afterEach(clearCache)

test('Basic build is generating proper file.', async () => {
  const { dist } = prepare([packageJson('build'), file('index.ts', "console.log('Hello')")])

  configure()
  await build()

  const contents = contentsForFilesMatching('*', dist)

  expect(contents.length).toEqual(1)
  expect(contents[0].contents).toContain('Hello')
  // No source map generated.
  expect(contents[0].contents).not.toContain('sourceMappingURL')
})

test('Type annotations are removed.', async () => {
  const { dist } = prepare([
    packageJson('annotations'),
    file('index.ts', 'const count: number = 5; console.log(count)'),
  ])

  configure()
  await build()

  const contents = contentsForFilesMatching('*', dist)

  // Type annotation is gone.
  expect(contents[0].contents).not.toContain('number')
})

test("Result is bundled as tsc doesn't produce valid ESM.", async () => {
  const { dist } = prepare([
    packageJson('build'),
    file(
      'index.ts',
      "import { named } from './named'; import defaultExport from './default-export'; console.log(named, defaultExport)"
    ),
    file('named.ts', 'export const named = 5'),
    file('default-export.ts', 'export default 8'),
  ])

  configure()
  await build()

  const contents = contentsForFilesMatching('*', dist)

  expect(contents.length).toEqual(1)
  expect(contents[0].name).toEqual('index.js')
  expect(contents[0].contents).toContain('named = 5')
})

test('Build can watch for changes.', async () => {
  const { dist } = prepare([packageJson('build'), file('index.ts', "console.log('Hello')")])

  configure()
  await build(true)

  await wait(1)

  let contents = contentsForFilesMatching('*', dist)

  expect(contents.length).toEqual(1)
  expect(contents[0].contents).toContain('Hello')

  writeFile('index.ts', "console.log('World')")

  await wait(1)

  contents = contentsForFilesMatching('*', dist)

  expect(contents.length).toEqual(1)
  expect(contents[0].contents).not.toContain('Hello')
  expect(contents[0].contents).toContain('World')
})
