import { join } from 'path'
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
      extends: join(configurationPath(), 'eslint.cjs'),
    },
    engines: {
      node: '>= 14',
    },
  }

  if (options().test) {
    pkg.scripts.test = 'squak test'
    pkg.jest = {
      transform: {
        '^.+\\.tsx?$': 'ts-jest',
      },
      globals: {
        'ts-jest': {
          tsconfig: './tsconfig.json',
        },
      },
    }
  }

  return pkg
}
