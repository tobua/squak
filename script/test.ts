import { execSync } from 'child_process'
import { options } from '../options'
import { log } from '../helper'

export const test = () => {
  if (!options().test) {
    log(`No tests found in ${options().test}`, 'warning')
  }

  const additionalArguments = process.argv.slice(3)

  log('running tests...')

  execSync(`jest ${additionalArguments.join(' ')}`, {
    stdio: 'inherit',
    cwd: process.cwd(),
  })
}
