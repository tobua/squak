import type { BuildOptions } from 'esbuild'

export interface Package {
  name: string
  squak?: Object
  dependencies?: Object
  peerDependencies?: Object
  scripts?: Object
}

export interface Options {
  test: false | string
  entry: string[]
  output: string
  pkg: Package
  tsconfig?: Object
  gitignore?: string[]
  esbuild?: BuildOptions
  hash: string
}
