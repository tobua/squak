import {
  prepare,
  environment,
  packageJson,
  file,
  contentsForFilesMatching,
} from 'jest-fixture'
import { configure } from '../configure'
import { build } from '../script/build'
import { clearCache } from '../helper'

environment('build')

afterEach(clearCache)

test('Basic build is generating proper file.', () => {
  const { dist } = prepare([
    packageJson('build'),
    file('index.ts', "console.log('Hello')"),
  ])

  configure()
  build()

  const contents = contentsForFilesMatching('*', dist)

  expect(contents.length).toEqual(1)
  expect(contents[0].contents).toContain('Hello')
  // No source map generated.
  expect(contents[0].contents).not.toContain('sourceMappingURL')
})

test('Type annotations are removed.', () => {
  const { dist } = prepare([
    packageJson('annotations'),
    file('index.ts', 'const count: number = 5; console.log(count)'),
  ])

  configure()
  build()

  const contents = contentsForFilesMatching('*', dist)

  // Type annotation is gone.
  expect(contents[0].contents).not.toContain('number')
})

test("Named and default imports work but aren't bundled.", () => {
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
  build()

  const contents = contentsForFilesMatching('*', dist)

  expect(contents.length).toEqual(3)
  // No bundling happens, as size is not a concern.
  expect(contents[1].name).toEqual('index.js')
  expect(contents[1].contents).toContain('import')
})
