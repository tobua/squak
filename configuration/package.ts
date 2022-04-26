import { join, sep } from 'path'
import { options } from '../options'
import { configurationPath } from '../helper'

// Old package properties users might have that should be deleted or updated.
export const packagePropertiesToUpdate = [
  // Keep node version up-to-date.
  'engines',
]

export const packageJson = () => {
  const pkg: any = {
    scripts: {
      start: 'squak start',
      production: 'squak production',
    },
    type: 'module',
    prettier: 'squak/configuration/.prettierrc.json',
    eslintConfig: {
      extends: join(configurationPath(), 'eslint.cjs').split(sep).join('/'),
    },
    engines: {
      node: '>= 14',
    },
  }

  if (options().test) {
    pkg.scripts.test = 'squak test'
    pkg.jest = {
      transform: {
        '^.+\\.(j|t)sx?$': '@swc/jest',
      }
    }
  }

  return pkg
}
