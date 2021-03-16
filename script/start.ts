import { spawn } from 'child_process'
import { log } from '../helper'
import { options } from '../options'
import { build } from './build'

export const start = () => {
  log('starting...')

  // Regular build first, to ensure files for nodemon are available.
  build()

  // Run TSC Watcher and Server in parallel.
  const childTsc = spawn('tsc', ['--watch'], {
    stdio: 'inherit',
    cwd: process.cwd(),
  })

  const childNodemon = spawn(
    'nodemon',
    ['-q', `${options().output}/index.js`],
    {
      stdio: 'inherit',
      cwd: process.cwd(),
    }
  )

  // Close server manually for tests.
  return () => {
    childTsc.kill()
    childNodemon.kill()
  }
}
