---
theme: default
title: slidev-addon-picjs
---

# slidev-addon-picjs

[picjs](https://github.com/pragdave-devo/picjs) diagrams and animations from code blocks.

Press <kbd>→</kbd> for examples.

---

# Static diagram

```picjs {width: '70%'}
Palette.current = "shuksan"
box "Input" -> box "Process" fill ~b2 -> box "Output"
```

---

# Source and diagram

```picjs example
petals = 12
petal = (color) => {
  4.times(=> {
    Arc stroke color
    Arc ccw stroke color.spin(10)
    Arc stroke color.spin(20)
  })
}
petals.times(n => {
  Face 360/petals*n
  petal(oklch(70%, .3, 0).spin(n*30))
})
```

---

# Animated, with player controls

```picjs animated autoplay {width: '70%'}
Palette.current = "shuksan"
a = box "A"
b = box "B" fill ~b2 at a.e + (2, 0)
@ += 0.5
move a.c to b.e + (1.5, 0) take 1 ease "cubicInOut"
then move a.c to b.w - (1.5, 0) take 1 ease "cubicInOut"
```
