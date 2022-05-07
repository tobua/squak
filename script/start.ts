import { spawn } from 'child_process'
import { options } from '../options'
import { build } from './build'

export const start = async () => {
  await build(true)

  const instances = options().entry.map((entry) => {
    const entryFile = `${options().output}/${entry.replace('.ts', '.js')}`
    return spawn('nodemon', ['-q', entryFile], {
      stdio: 'inherit',
      cwd: process.cwd(),
      shell: true,
    })
  })

  // Close server manually for tests.
  return () => instances.forEach((instance) => instance.kill())
}
