import { join } from 'path'
import { options } from '../options'
import { getProjectBasePath } from '../helper'

const customRules = {
  // Use named exports to make it easier to find usages.
  'import/prefer-default-export': 0,
  // Allow assignment to function param properties, like parameter.innerHTML = ...
  'no-param-reassign': [2, { props: false }],
}

export const eslint = () => ({
  // base as we don't need React on the server.
  extends: ['airbnb-base', 'airbnb-typescript/base', 'prettier'],
  rules: customRules,
  ignorePatterns: [options().output],
  env: {
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: join(getProjectBasePath(), 'tsconfig.json'),
  },
  overrides: [
    {
      // Tests
      files: ['**/*.test.ts'],
      env: {
        jest: true,
      },
    },
  ],
})
