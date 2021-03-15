import { join } from 'path'
import { execSync } from 'child_process'
import rimraf from 'rimraf'
import { options } from '../options'
import { log } from '../helper'

export const build = () => {
  log('building...')
  rimraf.sync(join(process.cwd(), options().output))
  execSync('tsc', { stdio: 'inherit', cwd: process.cwd() })
}
