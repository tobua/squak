import { spawn } from 'child_process'
import { options } from '../options'
import { build } from './build'

export const start = async () => {
  const entryFile = `${options().output}/index.js`

  await build(true)

  const childNodemon = spawn('nodemon', ['-q', entryFile], {
    stdio: 'inherit',
    cwd: process.cwd(),
    shell: true,
  })

  // Close server manually for tests.
  return () => childNodemon.kill()
}
