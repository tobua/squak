import { existsSync, rmSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'
import esbuild, { BuildContext } from 'esbuild'
import { options } from '../options'
import { log } from '../helper'
import { esbuildConfiguration } from '../configuration/esbuild'

const javaScriptBuild = async (watch: boolean) => {
  let firstBuild = true

  const onWatchPlugin = {
    name: 'on-watch-plugin',
    setup(build) {
      build.onStart(() => {
        if (!firstBuild) {
          console.log('')
          log('rebuilding...')
        } else {
          firstBuild = false
        }
      })
    },
  }

  const buildOptions = esbuildConfiguration()

  let context: BuildContext

  // Will print errors and warnings to the console.
  try {
    context = await esbuild.context({ ...buildOptions, plugins: [onWatchPlugin] })
    // First build has to be triggered manually.
    await context.rebuild()
  } catch (error) {
    // Won't keep watching if initial build fails.
    process.exit(1)
  }

  if (watch) {
    await context.watch()
  }

  if (!watch) {
    await context.dispose()
  }

  return () => context.dispose()
}

export const build = (watch = false) => {
  if (!watch) {
    log('Checking types...')
    const tsconfigPath = join(process.cwd(), 'tsconfig.json')
    execSync(`tsc --project "${tsconfigPath}" --noEmit`, { stdio: 'inherit', cwd: process.cwd() })
  }

  log(watch ? 'watching...' : 'building...')

  const outputDirectory = join(process.cwd(), options().output)

  if (!watch) {
    if (existsSync(outputDirectory)) {
      rmSync(outputDirectory, { recursive: true })
    }
  }

  return javaScriptBuild(watch)
}
