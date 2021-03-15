const { join } = require('path')

const customRules = {
  // Use named exports to make it easier to find usages.
  'import/prefer-default-export': 0,
  // Allow assignment to function param properties, like parameter.innerHTML = ...
  'no-param-reassign': [2, { props: false }],
}

// Needs to be old CJS module.
module.exports = {
  extends: ['airbnb-typescript', 'prettier'],
  rules: customRules,
  // TODO read from options().output
  ignorePatterns: ['dist'],
  env: {
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: join(process.cwd(), 'tsconfig.json'),
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
}
