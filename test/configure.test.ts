import { test, expect, beforeEach, afterEach, vi } from 'vitest'
import { registerVitest, prepare, environment, packageJson, file, readFile } from 'jest-fixture'
import { createHash } from 'node:crypto'
import {
  configurePackageJson,
  configureGitignore,
  configureTsconfig,
  configureEslint,
  configurePrettier,
} from '../configure'
import { clearCache } from '../helper'

registerVitest(beforeEach, afterEach, vi)

const hashFromName = (name: string) => createHash('md5').update(name).digest('hex').substring(0, 3)

environment('configure')

afterEach(clearCache)

test('Package.json is created properly.', () => {
  prepare([packageJson('basic'), file('index.ts', '')])

  configurePackageJson()

  const contents = readFile('package.json')

  // Generated configuration files placed in hashed folder.
  const hash = hashFromName('basic')

  expect(Object.keys(contents.scripts).length).toBeGreaterThanOrEqual(1)
  expect(contents.type).toEqual('module')
  expect(contents.engines.node).toEqual('>= 14')
  expect(contents.scripts.test).not.toBeDefined()
  expect(contents.jest).not.toBeDefined()
  expect(contents.prettier).toEqual(`./node_modules/squak/${hash}/.prettierrc.json`)
  expect(contents.eslintConfig.extends).toEqual(`./node_modules/squak/${hash}/.eslintrc.json`)
})

test('Gitignore is created properly.', () => {
  prepare([packageJson('gitignore'), file('index.ts', '')])

  configureGitignore()

  const contents = readFile('.gitignore')

  expect(contents).toEqual(
    ['node_modules', 'package-lock.json', 'tsconfig.json', 'dist', ''].join('\r\n')
  )
})

test('Correct configuration for different options.', () => {
  prepare([
    packageJson('modified', {
      squak: {
        output: 'hello',
        gitignore: ['test/fixture'],
        test: 'spec',
        entry: 'entry.ts',
      },
    }),
    file('entry.ts', ''),
    file('spec/basic.test.ts', ''),
  ])

  configurePackageJson()
  configureGitignore()

  const contentsPackageJson = readFile('package.json')
  const contentsGitignore = readFile('.gitignore')

  expect(contentsPackageJson.jest).toBeDefined()
  expect(contentsGitignore).toContain('hello')
  expect(contentsGitignore).not.toContain('dist')
})

test('TypeScript Configuration is created.', () => {
  prepare([packageJson('basic'), file('index.ts', '')])

  configureTsconfig()

  const contents = readFile('tsconfig.json')

  expect(contents.compilerOptions).toBeDefined()
  expect(contents.files).toContain('index.ts')
  expect(contents.exclude).toContain('dist')
  expect(contents.compilerOptions.baseUrl).toEqual('.')
  expect(contents.compilerOptions.outDir).toEqual('dist')
  expect(contents.compilerOptions.moduleResolution).toEqual('node')
  expect(contents.include).not.toBeDefined()
})

test('Proper tsconfig.json with various configurations.', () => {
  prepare([
    packageJson('modified', {
      squak: {
        output: 'hello',
        test: 'spec',
        entry: 'entry.ts',
        tsconfig: {
          compilerOptions: {
            moduleResolution: 'classic',
          },
          include: ['./global.d.ts'],
        },
      },
    }),
    file('entry.ts', ''),
    file('spec/basic.test.ts', ''),
  ])

  configureTsconfig()

  const contents = readFile('tsconfig.json')

  expect(contents.files).toContain('entry.ts')
  expect(contents.exclude).toContain('hello')
  expect(contents.compilerOptions.baseUrl).toEqual('.')
  expect(contents.compilerOptions.outDir).toEqual('hello')
  expect(contents.include).toContain('spec')
  expect(contents.compilerOptions.moduleResolution).toEqual('classic')
  expect(contents.include).toContain('./global.d.ts')
})

test('ESLint configuration is created.', () => {
  prepare([packageJson('eslint'), file('index.ts', '')])

  configureEslint()

  const hash = hashFromName('eslint')

  const contents = readFile(`node_modules/squak/${hash}/.eslintrc.json`)

  expect(contents).toBeDefined()
  expect(contents.extends).toContain('airbnb-base')
  expect(contents.ignorePatterns).toContain('dist')
})

test('Prettier configuration is created.', () => {
  prepare([packageJson('prettier'), file('index.ts', '')])

  configurePrettier()

  const hash = hashFromName('prettier')

  const contentsConfig = readFile(`node_modules/squak/${hash}/.prettierrc.json`)
  const contentsIgnore = readFile(`node_modules/squak/${hash}/.prettierignore`)

  expect(contentsConfig).toBeDefined()
  expect(contentsIgnore).toBeDefined()
  expect(contentsConfig.singleQuote).toBe(true)
  expect(contentsIgnore).toContain('dist')
})
