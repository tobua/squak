import { join } from 'path'
import { execSync } from 'child_process'
import rimraf from 'rimraf'
import { build as esbuild, WatchMode } from 'esbuild'
import { options } from '../options'
import { log } from '../helper'
import { esbuildConfiguration } from '../configuration/esbuild'

const javaScriptBuild = (watch: boolean | WatchMode) => {
  if (watch) {
    // eslint-disable-next-line no-param-reassign
    watch = {
      onRebuild: (error) => {
        // Error is ignored as it's already printed to the console.
        if (!error) {
          console.log('')
          log('rebuilding...')
        }
      },
    }
  }

  const buildOptions = esbuildConfiguration(watch)

  // Will print errors and warnings to the console.
  try {
    return esbuild(buildOptions)
  } catch (error) {
    // Won't keep watching if initial build fails.
    return process.exit(1)
  }
}

export const build = (watch = false) => {
  if (!watch) {
    log('Checking types...')
    const tsconfigPath = join(process.cwd(), 'tsconfig.json')
    execSync(`tsc --project "${tsconfigPath}" --noEmit`, { stdio: 'inherit', cwd: process.cwd() })
  }

  log(watch ? 'watching...' : 'building...')

  if (!watch) {
    rimraf.sync(join(process.cwd(), options().output))
  }

  return javaScriptBuild(watch)
}
