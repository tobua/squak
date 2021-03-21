import { existsSync } from 'fs'
import { join } from 'path'
import { spawn } from 'child_process'
import { log } from '../helper'
import { options } from '../options'
import { build } from './build'

export const start = () => {
  const entryFile = `${options().output}/index.js`

  // Regular build first, to ensure files for nodemon are available.
  if (!existsSync(join(process.cwd(), entryFile))) {
    build()
  }

  log('starting...')

  // Run TSC Watcher and Server in parallel.
  const childTsc = spawn('tsc', ['--watch'], {
    stdio: 'inherit',
    cwd: process.cwd(),
  })

  const childNodemon = spawn('nodemon', ['-q', entryFile], {
    stdio: 'inherit',
    cwd: process.cwd(),
  })

  // Close server manually for tests.
  return () => {
    childTsc.kill()
    childNodemon.kill()
  }
}
