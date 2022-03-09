import { join } from 'path'
import { prepare, environment, packageJson, file, readFile, writeFile } from 'jest-fixture'
import { lint } from '../script/lint'
import { clearCache } from '../helper'
import { configurePackageJson, configureTsconfig } from '../configure'

jest.setTimeout(50000)

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

const getEslintResultsForFile = (fileName: string, results: { filePath: string }[]) => {
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
    file('index.ts', `import 'nested/deep/hello-world'; let test  = 5; console.log(test);`),
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
  // Not assigned let switched to const.
  expect(testContents).toContain('const test')
  // Proper trim, semicolons removed.
  expect(testContents).toContain(`{\n  const test = 5\n  expect(5).toEqual(test)\n}`)

  const indexResults = getEslintResultsForFile('index.ts', eslintResults)
  const nestedResults = getEslintResultsForFile('nested/deep/hello-world.ts', eslintResults)
  const testResults = getEslintResultsForFile('test/basic.test.ts', eslintResults)

  expect(indexResults.errorCount).toEqual(0)
  expect(indexResults.warningCount).toEqual(1)

  expect(nestedResults.errorCount).toEqual(0)
  expect(nestedResults.warningCount).toEqual(1)

  expect(testResults.errorCount).toEqual(0)
  expect(testResults.warningCount).toEqual(0)
})

test('eslintConfig property in package.json is applied.', async () => {
  // This is someshow required to run multiple lint tests in a single file.
  jest.resetModules()
  prepare([
    packageJson('configuring-eslint', {
      eslintConfig: {
        rules: {
          'no-console': 0,
          'prefer-const': 0,
        },
      },
    }),
    file('index.ts', `let test = 5; console.log(test)`),
  ])

  configurePackageJson()
  configureTsconfig()

  // Doesn't require lint configuration in package.json
  const eslintResults = await lint()

  const indexResults = getEslintResultsForFile('index.ts', eslintResults)

  // No warning or errors for console statement and constant let variable.
  expect(indexResults.errorCount).toEqual(0)
  expect(indexResults.warningCount).toEqual(0)
})

test('Rules fixable by eslint are fixed in file.', async () => {
  // This is someshow required to run multiple lint tests in a single file.
  jest.resetModules()
  prepare([packageJson('eslint-fix'), file('index.ts', `const test = !!!false; console.log(test)`)])

  configurePackageJson()
  configureTsconfig()

  // Doesn't require lint configuration in package.json
  const eslintResults = await lint()

  const indexResults = getEslintResultsForFile('index.ts', eslintResults)
  const indexContents = readFile('index.ts')

  // Fixed rules aren't reported.
  expect(indexResults.errorCount).toEqual(0)
  // Warning for console statement.
  expect(indexResults.warningCount).toEqual(1)
  expect(indexResults.messages[0].ruleId).toEqual('no-console')

  expect(indexContents).not.toContain('!!')
  expect(indexContents).toContain('!false')
})
