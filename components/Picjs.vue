<!--
Picjs
(auto transformed from ```picjs code blocks; you don't normally use this directly)

Props:
  code-lz   picjs source, lz-string compressToBase64
  mode      "static" (default) | "animated" (picjs player with controls)
  autoplay  start the animation as soon as the diagram is rendered
  width     CSS width for the diagram (default 100%)
-->

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import lz from 'lz-string'
import { parse, renderToString } from '@strike48/picjs'
import { PicjsPlayer } from '@strike48/picjs/runtime'

const props = withDefaults(defineProps<{
  codeLz: string
  mode?: 'static' | 'animated'
  autoplay?: boolean
  width?: string
}>(), { mode: 'static', autoplay: false })

const host = ref<HTMLElement>()
const error = ref<string | null>(null)
let player: PicjsPlayer | null = null
let observer: ResizeObserver | null = null
let rendered = false

// picjs emits its palette as light-mode overrides under a selector; Slidev
// toggles html.dark / html.light rather than prefers-color-scheme.
const THEME_SELECTOR = 'html:not(.dark)'

function render(el: HTMLElement) {
  error.value = null
  player?.destroy()
  player = null
  el.replaceChildren()

  const source = lz.decompressFromBase64(props.codeLz) || ''
  const result = renderToString(source, { includeSource: false, themeSelector: THEME_SELECTOR })
  if (result.error) {
    error.value = result.error
    return
  }

  if (props.mode !== 'animated') {
    el.innerHTML = result.svg
    rendered = true
    return
  }

  const parsed = parse(source)
  if (parsed.status !== 'ok') {
    error.value = parsed.error?.message ?? 'picjs parse error'
    return
  }

  const container = document.createElement('div')
  container.className = 'picjs-player'
  container.setAttribute('data-picjs-player', '')
  // The player builds its own <svg> and does not emit palette CSS, so lift the
  // palette <style> out of the static render and put it beside the player.
  const palette = result.svg.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? ''
  container.innerHTML = `<style>${palette}</style>`
  const ast = document.createElement('script')
  ast.type = 'application/json'
  ast.setAttribute('data-picjs-ast', '')
  ast.textContent = JSON.stringify(parsed.ast)
  container.appendChild(ast)
  el.appendChild(container)

  try {
    player = new PicjsPlayer(container)
    if (props.autoplay)
      player.play()
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  }
  rendered = true
}

onMounted(() => {
  const el = host.value!
  // Slidev pre-renders neighbouring slides at zero size. picjs text laid out
  // inside a zero-size <svg> is never repainted once the slide is shown, so
  // wait until the host actually has a width before rendering.
  observer = new ResizeObserver(() => {
    if (!rendered && el.getBoundingClientRect().width > 0)
      render(el)
  })
  observer.observe(el)
  if (el.getBoundingClientRect().width > 0)
    render(el)
})

watch(() => [props.codeLz, props.mode], () => {
  if (host.value && host.value.getBoundingClientRect().width > 0)
    render(host.value)
  else
    rendered = false
})

onBeforeUnmount(() => {
  observer?.disconnect()
  player?.destroy()
})
</script>

<template>
  <pre v-if="error" class="picjs-error">{{ error }}</pre>
  <div ref="host" class="slidev-picjs" :style="width ? { width } : undefined" />
</template>

<style>
.slidev-picjs svg {
  display: block;
  width: 100%;
  height: auto;
}
.picjs-error {
  border: 2px solid #c00;
  color: #900;
  padding: 0.5rem 0.75rem;
  white-space: pre-wrap;
}
</style>
