import type { CodeblockTransformContext } from '@slidev/types'
import lz from 'lz-string'
import { describe, expect, it, vi } from 'vitest'
import { parseInfo, picjsCodeblock } from '../setup/transformers'

const source = 'box "Hello" -> box "World"'

function ctx(info: string, code = source) {
  return {
    info,
    code,
    renderHighlighted: vi.fn(async ({ info: i }: { info?: string }) => `<pre class="shiki" data-lang="${i}">{{code}}</pre>`),
  } as unknown as CodeblockTransformContext & { renderHighlighted: ReturnType<typeof vi.fn> }
}

function decode(out: string) {
  return lz.decompressFromBase64(out.match(/code-lz="([^"]+)"/)![1])
}

describe('parseInfo', () => {
  it('accepts the bare language and known flags', () => {
    expect(parseInfo('picjs')?.flags.size).toBe(0)
    expect([...parseInfo('picjs animated autoplay')!.flags]).toEqual(['animated', 'autoplay'])
    expect(parseInfo('picjs example')?.flags.has('example')).toBe(true)
  })

  it('captures trailing options', () => {
    expect(parseInfo(`picjs {width: '50%'}`)?.options).toBe(`{width: '50%'}`)
    expect(parseInfo(`picjs animated {width: '50%'}`)?.options).toBe(`{width: '50%'}`)
  })

  it('rejects other languages and unknown flags', () => {
    expect(parseInfo('picjsx')).toBeUndefined()
    expect(parseInfo('js')).toBeUndefined()
    expect(parseInfo('picjs bogus')).toBeUndefined()
  })
})

describe('picjsCodeblock', () => {
  it('ignores other languages', async () => {
    expect(await picjsCodeblock(ctx('ts'))).toBeUndefined()
  })

  it('emits a <Picjs> with the source compressed into code-lz', async () => {
    const out = (await picjsCodeblock(ctx('picjs')))!
    expect(out).toMatch(/^<Picjs code-lz="[^"]+" \/>$/)
    expect(decode(out)).toBe(source)
  })

  it('passes animated, autoplay and options through as props', async () => {
    const out = (await picjsCodeblock(ctx(`picjs animated autoplay {width: '50%'}`)))!
    expect(out).toContain('mode="animated"')
    expect(out).toContain(' autoplay')
    expect(out).toContain(`v-bind="{width: '50%'}"`)
  })

  it('renders highlighted source beside the diagram in example mode', async () => {
    const c = ctx('picjs example')
    const out = (await picjsCodeblock(c))!
    expect(c.renderHighlighted).toHaveBeenCalledWith({ info: 'picjs' })
    expect(out).toMatch(/^<div class="picjs-example"><div class="picjs-example-source">.*<\/div><div class="picjs-example-diagram"><Picjs .* \/><\/div><\/div>$/)
    expect(out).toContain('&lbrace;&lbrace;code}}')
  })
})
