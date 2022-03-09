import { options } from '../options'

export const gitignore = () => {
  const entries = ['node_modules', 'package-lock.json', 'tsconfig.json', options().output]

  const fromPackage = options().gitignore

  if (fromPackage && Array.isArray(fromPackage) && fromPackage.length > 0) {
    entries.concat(fromPackage)
  }

  return entries
}
