import { ESLint } from 'eslint'
import { execSync } from 'child_process'
import { options } from '../options'
import { log, hashPath } from '../helper'

export const lint = async () => {
  log('formatting files...')
  const configurationFolder = hashPath(options)
  execSync(
    `prettier --write "**/*.ts" --config "${configurationFolder}/.prettierrc.json" --ignore-path "${configurationFolder}/.prettierignore"`,
    { stdio: 'inherit', cwd: process.cwd() }
  )
  // eslint-disable-next-line no-console
  console.log('')

  log('linting files...')
  const linter = new ESLint({
    fix: true,
    extensions: ['.ts'],
  })

  const results = await linter.lintFiles('.')
  await ESLint.outputFixes(results)
  const formatter = await linter.loadFormatter('stylish')
  const resultText = formatter.format(results)

  if (resultText) {
    // eslint-disable-next-line no-console
    console.log(resultText)
  }

  return results
}
