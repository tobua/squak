import { join, sep } from 'path'
import { options } from '../options'
import { hashPath } from '../helper'

// Old package properties users might have that should be deleted or updated.
export const packagePropertiesToUpdate = [
  // Keep node version up-to-date.
  'engines',
  'prettier',
  'eslintConfig.extends',
]

export const packageJson = () => {
  const pkg: any = {
    scripts: options().pkg.scripts,
    type: 'module',
    prettier: `.${sep}${join(hashPath(options), '.prettierrc.json')}`,
    eslintConfig: {
      extends: `.${sep}${join(hashPath(options), '.eslintrc.json')}`,
    },
    engines: {
      node: '>= 16',
    },
  }

  if (!options().pkg.scripts) {
    pkg.scripts = {
      start: 'squak start',
      production: 'squak production',
    }
  }

  if (options().test) {
    pkg.scripts.test = 'squak test'
    pkg.jest = {
      transform: {
        '^.+\\.(j|t)sx?$': '@swc/jest',
      },
    }
  }

  return pkg
}
