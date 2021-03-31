import merge from 'deepmerge'
import { options } from '../options'

export const tsconfig = () => {
  const userTSConfig = {
    extends: 'squak/configuration/tsconfig',
  }

  // The local tsconfig in this package will be written and the user config is extending it.
  let packageTSConfig: any = {
    compilerOptions: {
      target: 'esnext',
      module: 'esnext',
      esModuleInterop: true,
      moduleResolution: 'node',
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      outDir: `../../../${options().output}`,
      baseUrl: '../../..',
    },
    files: options().entry.map((entry) => `../../../${entry}`),
    exclude: [`../../../${options().output}`],
  }

  if (options().test) {
    packageTSConfig.include = [`../../../${options().test}`]
  }

  if (options().tsconfig) {
    packageTSConfig = merge(packageTSConfig, options().tsconfig, {
      clone: false,
    })
  }

  return [userTSConfig, packageTSConfig]
}
