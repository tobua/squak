import merge from 'deepmerge'
import { BuildOptions, WatchMode } from 'esbuild'
import { options } from '../options'

export const esbuildConfiguration = (watch: boolean | WatchMode) => {
  // dependencies and peerDependencies are installed and better bundled by user to avoid duplication.
  // Use devDependencies to ensure dependency results in distributed bundle.
  const userDependencies = []
    .concat(Object.keys(options().pkg.dependencies || {}))
    .concat(Object.keys(options().pkg.peerDependencies || {}))
  const userESBuildConfiguration = typeof options().esbuild === 'object' ? options().esbuild : {}

  let buildOptions: BuildOptions = {
    // entryPoints needs to be an array.
    entryPoints: options().entry,
    outdir: options().output,
    minify: false,
    bundle: true,
    external: userDependencies,
    sourcemap: false,
    color: true,
    absWorkingDir: process.cwd(),
    target: 'node14',
    platform: 'node',
    format: 'esm',
    watch,
    tsconfig: 'tsconfig.json',
  }

  buildOptions = merge(buildOptions, userESBuildConfiguration)

  return buildOptions
}
