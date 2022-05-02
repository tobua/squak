import { spawn, execSync } from 'child_process'
import { log } from '../helper'
import { options } from '../options'
import { build } from './build'

export const production = () => {
  // Regular build.
  build(false)

  log('Pruning devDependencies...')

  execSync('npm prune --production', { stdio: 'inherit', cwd: process.cwd() })

  log('Starting server...')

  const child = spawn('node', [`${options().output}/index.js`], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true,
  })

  // Close server manually for tests.
  return () => child.kill()
}
