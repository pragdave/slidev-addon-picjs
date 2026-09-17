import { readFile } from 'node:fs/promises'
import { defineShikiSetup } from '@slidev/types'

// Registers the `picjs` language so ```picjs example blocks (and plain ```picjs
// blocks shown as code elsewhere) get syntax highlighting.
export default defineShikiSetup(async () => {
  const grammar = JSON.parse(await readFile(new URL('../syntaxes/picjs.tmLanguage.json', import.meta.url), 'utf-8'))
  return { langs: [grammar] }
})
