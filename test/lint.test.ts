import { join } from 'path'
import {
  prepare,
  environment,
  packageJson,
  file,
  readFile,
  writeFile,
} from 'jest-fixture'
import { lint } from '../script/lint'
import { clearCache } from '../helper'
import { configurePackageJson, configureTsconfig } from '../configure'

// Increase timeout to 20 seconds when running in parallel with other tests.
jest.setTimeout(20000)

let packageContents = {}
const initialCwd = process.cwd()

// Remove configuration entries from main package, as it would
// otherwise be picked up, since it's closer to the root.
beforeAll(() => {
  packageContents = readFile('package.json')
  const copy: any = { ...packageContents }
  delete copy.eslintConfig
  delete copy.prettier

  writeFile(join(initialCwd, 'package.json'), copy)
})

// Restore initial project package.json.
afterAll(() => {
  writeFile(join(initialCwd, 'package.json'), packageContents)
})

environment('lint')

afterEach(clearCache)

const getEslintResultsForFile = (
  fileName: string,
  results: { filePath: string }[]
) => {
  let match = {}

  results.forEach((result) => {
    if (new RegExp(`.*/${fileName}$`).test(result.filePath)) {
      match = result
    }
  })

  return match as any
}

test('Proper tsconfig.json with various configurations.', async () => {
  prepare([
    packageJson('lint'),
    file(
      'index.ts',
      `import 'nested/deep/hello-world'; let test  = 5; console.log(test);`
    ),
    file('nested/deep/hello-world.ts', 'let test = 5 ; console.log(test);'),
    file(
      'test/basic.test.ts',
      `test('Hello', () => {        let test = 5; expect(5).toEqual(test);})`
    ),
  ])

  configurePackageJson()
  configureTsconfig()

  // Doesn't require lint configuration in package.json
  const eslintResults = await lint()

  const indexContents = readFile('index.ts')
  const nestedContents = readFile('nested/deep/hello-world.ts')
  const testContents = readFile('test/basic.test.ts')

  // Unnecessary space removed by prettier.
  expect(indexContents).toContain('test = 5')
  // Semicolons between lines replaced with newline and space trimmed.
  expect(nestedContents).toContain('test = 5\nconsole')
  // Proper trim, semicolons removed.
  expect(testContents).toContain(
    `{\n  let test = 5\n  expect(5).toEqual(test)\n}`
  )

  const indexResults = getEslintResultsForFile('index.ts', eslintResults)
  const nestedResults = getEslintResultsForFile(
    'nested/deep/hello-world.ts',
    eslintResults
  )
  const testResults = getEslintResultsForFile(
    'test/basic.test.ts',
    eslintResults
  )

  expect(indexResults.errorCount).toEqual(2)
  expect(indexResults.warningCount).toEqual(1)

  expect(nestedResults.errorCount).toEqual(1)
  expect(nestedResults.warningCount).toEqual(1)

  expect(testResults.errorCount).toEqual(1)
  expect(testResults.warningCount).toEqual(0)
})
