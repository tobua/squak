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

  const instances = options().entry.map((entry) => {
    const entryFile = `${options().output}/${entry.replace('.ts', '.js')}`
    return spawn('node', [entryFile], {
      stdio: 'inherit',
      cwd: process.cwd(),
      shell: true,
    })
  })

  // Close server manually for tests.
  return () => instances.forEach((instance) => instance.kill())
}
