import { prepare, environment, packageJson, file, listFilesMatching } from 'jest-fixture'
import { createHash } from 'node:crypto'
import { options } from '../options'
import { clearCache } from '../helper'

const [fixturePath] = environment('options')

afterEach(clearCache)

test('Default options work fine.', () => {
  prepare([packageJson('basic'), file('index.ts', "console.log('test')")], fixturePath)

  const result = options()

  expect(result.entry).toEqual(['index.ts'])
  expect(result.output).toEqual('dist')
  expect(result.test).toEqual(false)
  expect(result.pkg).toEqual({ name: 'basic' })
})

test('Entry file is generated when accessing options.', () => {
  prepare([packageJson('empty-entry')], fixturePath)

  const result = options()
  const files = listFilesMatching('*.ts', fixturePath)

  expect(result.entry).toEqual(['index.ts'])
  expect(files[0]).toEqual('index.ts')
})

test('Entry file can be configured.', () => {
  prepare(
    [
      packageJson('basic', { squak: { entry: 'hello.ts' } }),
      file('hello.ts', "console.log('test')"),
    ],
    fixturePath
  )

  const result = options()

  expect(result.entry).toEqual(['hello.ts'])
})

test('Non existing-entries will be removed.', () => {
  prepare(
    [
      packageJson('basic', { squak: { entry: ['gone.ts', 'hello.ts'] } }),
      file('hello.ts', "console.log('test')"),
    ],
    fixturePath
  )

  const result = options()

  expect(result.entry).toEqual(['hello.ts'])
})

test('Entry from /src will be picked up.', () => {
  prepare(
    [packageJson('basic', { squak: { entry: ['gone.ts'] } }), file('src/index.ts', '')],
    fixturePath
  )

  const result = options()

  expect(result.entry).toEqual(['src/index.ts'])
})

test('Duplicate paths that are absolutely equal will be removed.', () => {
  prepare(
    [
      packageJson('basic', {
        squak: { entry: ['hello.ts', './hello.ts', '../options/hello.ts'] },
      }),
      file('hello.ts', ''),
    ],
    fixturePath
  )

  const result = options()

  expect(result.entry).toEqual(['hello.ts'])
})

const hashFromName = (name: string) => createHash('md5').update(name).digest('hex').substring(0, 3)

test('Hash generated from package name.', () => {
  prepare([packageJson('generate-hash')], fixturePath)

  const hash = hashFromName('generate-hash')

  const result = options()

  expect(result.hash).toEqual(hash)
})
