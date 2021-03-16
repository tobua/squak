import { exec } from 'child_process'
import { log } from '../helper'
import { options } from '../options'
import { build } from './build'

export const start = () => {
  log('starting...')

  // Regular build first, to ensure files for nodemon are available.
  build()

  // Run TSC Watcher and Server in parallel.
  const child = exec(
    `tsc --watch & nodemon -q ${options().output}/index.js`,
    {
      cwd: process.cwd(),
    },
    (error, stdout, stderr) => {
      if (error) {
        log(error.toString(), 'error')
      }
      if (stdout) {
        log(stdout)
      }
      if (stderr) {
        log(stderr, 'warning')
      }
    }
  )

  // Close server manually for tests.
  return () => child.kill()
}
