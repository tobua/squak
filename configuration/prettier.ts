import { options } from '../options'

export const prettier = () => ({
  singleQuote: true,
  semi: false,
  printWidth: 100,
})

export const prettierIgnore = () => [options().output]
