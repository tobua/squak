import { accessSync, existsSync, constants, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { EOL } from 'os'
import { join } from 'path'
import formatJson from 'pakag'
import merge from 'deepmerge'
import parse from 'parse-gitignore'
import unset from 'lodash.unset'
import deepForEach from 'deep-for-each'
import isCI from 'is-ci'
import { getProjectBasePath, log, hashPath } from './helper'
import { options } from './options'
import { gitignore } from './configuration/gitignore'
import { packageJson, packagePropertiesToUpdate } from './configuration/package'
import { tsconfig } from './configuration/typescript'
import { eslint } from './configuration/eslint'
import { prettier, prettierIgnore } from './configuration/prettier'

export const ensureHashDirectory = () => {
  const hashDirectoryPath = join(getProjectBasePath(), hashPath(options))

  if (!existsSync(hashDirectoryPath)) {
    mkdirSync(hashDirectoryPath, { recursive: true })
  }
}

export const configurePrettier = () => {
  // Only ignore file is dynamic, but both are generated as the ignore file has to be in the same folder.
  const prettierConfigPath = join(getProjectBasePath(), hashPath(options), `.prettierrc.json`)
  const prettierignorePath = join(getProjectBasePath(), hashPath(options), `.prettierignore`)

  try {
    ensureHashDirectory()
    writeFileSync(prettierConfigPath, formatJson(JSON.stringify(prettier()), { sort: false }))
  } catch (_) {
    log(
      `Couldn't write ${prettierConfigPath}, therefore this plugin might not work as expected`,
      'warning'
    )
  }

  try {
    writeFileSync(prettierignorePath, prettierIgnore().join(EOL))
  } catch (_) {
    log(
      `Couldn't write ${prettierignorePath}, therefore this plugin might not work as expected`,
      'warning'
    )
  }
}

export const configureEslint = () => {
  const eslintConfigPath = join(getProjectBasePath(), hashPath(options), `.eslintrc.json`)

  try {
    ensureHashDirectory()
    writeFileSync(eslintConfigPath, formatJson(JSON.stringify(eslint()), { sort: false }))
  } catch (_) {
    log(
      `Couldn't write ${eslintConfigPath}, therefore this plugin might not work as expected`,
      'warning'
    )
  }
}

const writeUserAndPackageConfig = (
  userConfig: {},
  packageConfig: {},
  userTSConfigPath: string,
  packageTSConfigPath: string
) => {
  try {
    ensureHashDirectory()
    writeFileSync(packageTSConfigPath, formatJson(JSON.stringify(packageConfig), { sort: false }))
  } catch (_) {
    log(
      `Couldn't write ${packageTSConfigPath}, therefore this plugin might not work as expected`,
      'warning'
    )
  }

  try {
    writeFileSync(userTSConfigPath, formatJson(JSON.stringify(userConfig), { sort: false }))
  } catch (_) {
    log(
      `Couldn't write ${userTSConfigPath}, therefore this plugin might not work as expected`,
      'warning'
    )
  }
}

// remove ../../.. to place config in project root.
const adaptConfigToRoot = (packageConfig) => {
  deepForEach(packageConfig, (value: any, key: string, subject: Object) => {
    const baseFromPackagePath = '../../../'
    if (typeof value === 'string' && value.includes(baseFromPackagePath)) {
      subject[key] = value.replace(baseFromPackagePath, '')
    }
    if (value === '../../..') {
      subject[key] = '.'
    }
  })
}

const writeOnlyUserConfig = (userConfig, packageConfig, userTSConfigPath) => {
  try {
    delete userConfig.extends
    adaptConfigToRoot(packageConfig)
    writeFileSync(
      userTSConfigPath,
      formatJson(JSON.stringify(merge(userConfig, packageConfig, { clone: false })), {
        sort: false,
      })
    )
  } catch (_) {
    log(
      `Couldn't write ./tsconfig.json, therefore this plugin might not work as expected`,
      'warning'
    )
  }
}

export const configureTsconfig = () => {
  const userTSConfigPath = join(getProjectBasePath(), 'tsconfig.json')
  const packageTSConfigPath = join(getProjectBasePath(), hashPath(options), `tsconfig.json`)

  const [userConfig, packageConfig] = tsconfig()

  try {
    // If package tsconfig can be written, adapt it and only extend user config.
    accessSync(
      packageTSConfigPath,
      // eslint-disable-next-line no-bitwise
      constants.F_OK | constants.R_OK | constants.W_OK
    )

    writeUserAndPackageConfig(userConfig, packageConfig, userTSConfigPath, packageTSConfigPath)
  } catch (_) {
    // Package config cannot be written, write full contents to user file.
    writeOnlyUserConfig(userConfig, packageConfig, userTSConfigPath)
  }
}

export const configureGitignore = () => {
  const gitIgnorePath = join(getProjectBasePath(), '.gitignore')
  let entries: string[] = []

  if (existsSync(gitIgnorePath)) {
    entries = entries.concat(parse(readFileSync(gitIgnorePath, 'utf8')).patterns)
  }

  entries = entries.concat(gitignore())

  // Remove duplicates, add empty line at the end.
  entries = Array.from(new Set(entries)).concat('')

  writeFileSync(gitIgnorePath, entries.join('\r\n'))
}

export const removePropertiesToUpdate = (pkg: {}) => {
  // Don't make updates in CI to avoid surprises.
  if (!isCI) {
    packagePropertiesToUpdate.forEach((key) => unset(pkg, key))
  }
}

export const configurePackageJson = () => {
  const packageJsonContents = options().pkg
  let generatedPackageJson = packageJson()

  // Remove properties that should be kept up-to-date.
  removePropertiesToUpdate(packageJsonContents)

  // Merge existing configuration with additional required attributes.
  // Existing properties override generated configuration to allow
  // the user to configure it their way.
  generatedPackageJson = merge(generatedPackageJson, packageJsonContents, {
    clone: false,
  })

  // Format with prettier and sort before writing.
  writeFileSync(
    join(getProjectBasePath(), './package.json'),
    formatJson(JSON.stringify(generatedPackageJson))
  )

  options().pkg = generatedPackageJson
}

export const configure = () => {
  configurePackageJson()
  configureGitignore()
  configureTsconfig()
  configureEslint()
  configurePrettier()
}
