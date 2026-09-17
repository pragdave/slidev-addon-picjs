import { defineCodeblockTransformer, defineTransformersSetup } from '@slidev/types'
import lz from 'lz-string'

// ```picjs                     static diagram
// ```picjs animated            diagram with the picjs player (play/scrub/speed)
// ```picjs animated autoplay   ...and start playing when the slide is shown
// ```picjs example             highlighted source on the left, diagram on the right
// ```picjs {width: '60%'}      trailing {...} is bound to the <Picjs> component
const RE_INFO = /^picjs\b((?:\s+[a-z]+)*)\s*(\{[^\n]*\})?\s*$/

const FLAGS = new Set(['animated', 'autoplay', 'example'])

export interface PicjsInfo {
  flags: Set<string>
  options?: string
}

export function parseInfo(info: string): PicjsInfo | undefined {
  const match = info.match(RE_INFO)
  if (!match)
    return
  const [, words = '', options] = match
  const flags = new Set(words.trim().split(/\s+/).filter(Boolean))
  for (const flag of flags) {
    if (!FLAGS.has(flag))
      return
  }
  return { flags, options }
}

function escapeVue(html: string): string {
  return html.replace(/\{\{/g, '&lbrace;&lbrace;')
}

export const picjsCodeblock = defineCodeblockTransformer(async ({ info, code, renderHighlighted }) => {
  const parsed = parseInfo(info)
  if (!parsed)
    return
  const { flags, options } = parsed

  const props = [`code-lz="${lz.compressToBase64(code.trim())}"`]
  if (flags.has('animated'))
    props.push('mode="animated"')
  if (flags.has('autoplay'))
    props.push('autoplay')
  if (options)
    props.push(`v-bind="${options}"`)
  const component = `<Picjs ${props.join(' ')} />`

  if (!flags.has('example'))
    return component

  const highlighted = await renderHighlighted({ info: 'picjs' })
  return `<div class="picjs-example">`
    + `<div class="picjs-example-source">${escapeVue(highlighted)}</div>`
    + `<div class="picjs-example-diagram">${component}</div>`
    + `</div>`
})

export default defineTransformersSetup(() => ({
  codeblocks: [picjsCodeblock],
}))
