import { exec, execSync } from 'child_process'
import { log } from '../helper'
import { options } from '../options'
import { build } from './build'

export const production = () => {
  // Regular build.
  build()

  log('Pruning devDependencies...')

  execSync('npm prune --production', { stdio: 'inherit', cwd: process.cwd() })

  log('Starting server...')

  const child = exec(`node ${options().output}/index.js`, {
    // stdio: 'inherit',
    cwd: process.cwd(),
  })

  // Close server manually for tests.
  return () => process.kill(child.pid)
}
