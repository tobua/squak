import { options } from '../options'

export const gitignore = () => {
  let entries = ['node_modules', 'package-lock.json', 'tsconfig.json', options().output]

  const fromPackage = options().gitignore

  if (fromPackage && Array.isArray(fromPackage) && fromPackage.length > 0) {
    entries = entries.concat(fromPackage)
  }

  return entries
}
