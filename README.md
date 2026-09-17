# slidev-addon-picjs

A [Slidev](https://sli.dev) addon that renders
[picjs](https://github.com/pragdave-devo/picjs) diagrams and animations from
fenced code blocks.

## Install

```sh
npm install slidev-addon-picjs
```

Then enable it in your deck's headmatter:

```md
---
addons:
  - picjs
---
```

## Use

A static diagram:

    ```picjs
    Palette.current = "shuksan"
    box "Input" -> box "Process" fill ~b2 -> box "Output"
    ```

Words after `picjs` on the info line select a mode:

| Info line | Result |
|---|---|
| `picjs` | static SVG |
| `picjs animated` | diagram with the picjs player (play, scrub, skip, speed) |
| `picjs animated autoplay` | player, and the animation starts when the slide is shown |
| `picjs example` | highlighted source on the left, diagram on the right |

A trailing `{...}` is bound to the `<Picjs>` component. `width` is the one
prop worth knowing about; diagrams default to the full content width:

    ```picjs animated {width: '60%'}
    ...
    ```

Diagrams are rendered in the browser, so they follow Slidev's light/dark
toggle live. The `picjs` language is registered with Shiki, so `example`
blocks and ordinary code blocks marked `picjs` are highlighted.

## How it works

- `setup/transformers.ts` turns each block into a `<Picjs>` component with the
  source compressed into a prop (the same approach Slidev uses for Mermaid).
- `components/Picjs.vue` renders the SVG with picjs's string renderer, or hands
  the container to the picjs player for animated blocks.
- `setup/shiki.ts` registers `syntaxes/picjs.tmLanguage.json`.

Two picjs behaviours the component works around, both candidates for upstream
fixes:

1. Slidev pre-renders neighbouring slides at zero size, and picjs text laid out
   in a zero-size SVG is never repainted once the slide appears. Rendering is
   deferred until the host element has a width.
2. The player builds its own SVG and does not emit the palette CSS that the
   static renderer puts inside its SVG, so shapes come out black. The component
   lifts that `<style>` out of a static render and places it beside the player.

## Limitations

- PDF export captures the first frame of an animation.
- Animations are not yet tied to Slidev clicks (`v-click`); use the player
  controls or `autoplay`.

## Development

```sh
npm install
npm run dev        # preview example.md
npm test           # transformer tests
npm run typecheck
```

Slidev compiles the `.ts` and `.vue` files itself; there is no build step.

## License

MIT
