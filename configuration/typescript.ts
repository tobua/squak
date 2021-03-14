import objectAssignDeep from 'object-assign-deep'
import { options } from '../options'

export const tsconfig = () => {
  const userTSConfig = {
    extends: 'squak/configuration/tsconfig',
  }

  // The local tsconfig in this package will be written and the user config is extending it.
  const packageTSConfig: any = {
    compilerOptions: {
      target: 'ESNext',
      module: 'ESNext',
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
    objectAssignDeep(userTSConfig, options().tsconfig)
  }

  return [userTSConfig, packageTSConfig]
}
