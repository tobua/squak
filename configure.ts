import { accessSync, existsSync, constants, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import formatJson from 'pakag'
import merge from 'deepmerge'
import parse from 'parse-gitignore'
import unset from 'lodash.unset'
import deepForEach from 'deep-for-each'
import isCI from 'is-ci'
import { getProjectBasePath, log } from './helper'
import { options } from './options'
import { gitignore } from './configuration/gitignore'
import { packageJson, packagePropertiesToUpdate } from './configuration/package'
import { tsconfig } from './configuration/typescript'

const writeUserAndPackageConfig = (
  userConfig: {},
  packageConfig: {},
  userTSConfigPath: string,
  packageTSConfigPath: string
) => {
  try {
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
  const packageTSConfigPath = join(
    getProjectBasePath(),
    `./node_modules/squak/configuration/tsconfig.json`
  )

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
    entries = entries.concat(parse(readFileSync(gitIgnorePath, 'utf8')))
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
}
