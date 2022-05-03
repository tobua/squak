import type { BuildOptions } from 'esbuild'

export interface Options {
  test: false | string
  entry: string[]
  output: string
  pkg: {
    dependencies?: Object
    peerDependencies?: Object
  }
  tsconfig?: Object
  gitignore?: string[]
  esbuild?: BuildOptions
  hash: string
}

export interface Package {
  name: string
  squak?: Object
  dependencies?: Object
  peerDependencies?: Object
}
