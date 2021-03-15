import { join } from 'path'
import eslint from 'eslint'
import { execSync } from 'child_process'
import { log, configurationPath } from '../helper'

const configurationFolder = configurationPath()

export const lint = async () => {
  log('formatting files..')
  execSync(
    `prettier --write '**/*.ts' --config ${configurationFolder}/.prettierrc.json --ignore-path ${configurationFolder}/.prettierignore`,
    { stdio: 'inherit', cwd: process.cwd() }
  )
  console.log('')

  log('linting files..')
  // CommonJS named exports not supported.
  const { ESLint } = eslint
  const linter = new ESLint({
    fix: false,
    extensions: ['.ts'],
  })

  const results = await linter.lintFiles('.')
  await ESLint.outputFixes(results)
  const formatter = await linter.loadFormatter('stylish')
  const resultText = formatter.format(results)

  // eslint-disable-next-line no-console
  console.log(resultText)

  return results
}
