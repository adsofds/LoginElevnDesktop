'use client'

/*
 * Paints a rendered (on-screen) SVG onto a canvas with the 2D API, element by element.
 *
 * Why not "serialize the SVG → <img> → drawImage"? Mobile Safari often drops embedded
 * images and web fonts in SVG-as-image, and draws nested SVGs inconsistently, so the
 * exported sticker came out with pieces missing. Painting directly uses the page's
 * already-loaded fonts and images and behaves the same in every browser.
 *
 * Supports what the share templates use: g, nested svg, rect (rx), circle, ellipse,
 * line, path, text with tspans (weight, anchor, letter-spacing), image, linear/radial
 * gradients (objectBoundingBox or userSpaceOnUse), opacity and a drop-shadow filter.
 */

type Shadow = { dx: number; dy: number; blur: number; color: string } | null

const SKIP = new Set([
  'defs',
  'style',
  'title',
  'desc',
  'linearGradient',
  'radialGradient',
  'filter',
  'clipPath',
  'mask',
])

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })

/** "rgb(1, 2, 3)" / "rgba(...)" + extra opacity → "rgba(...)". */
function withAlpha(color: string, alpha: number) {
  const match = color.match(/rgba?\(([^)]+)\)/)
  if (!match) return color
  const [r, g, b, a = '1'] = match[1].split(/[\s,/]+/).filter(Boolean)
  return `rgba(${r}, ${g}, ${b}, ${Number(a) * alpha})`
}

const urlId = (value: string) => value.match(/url\(["']?#([^"')]+)["']?\)/)?.[1]

/** Number or percentage attribute, as a fraction of `base` for percentages. */
function num(el: Element, name: string, fallback: number, base = 1) {
  const raw = el.getAttribute(name)
  if (raw === null || raw === '') return fallback
  return raw.trim().endsWith('%') ? (parseFloat(raw) / 100) * base : parseFloat(raw)
}

function shadowOf(el: Element, root: SVGSVGElement): Shadow {
  const id = urlId(el.getAttribute('filter') ?? '')
  const filter = id ? root.querySelector(`[id="${CSS.escape(id)}"]`) : null
  const drop = filter?.querySelector('feDropShadow')
  if (!drop) return null
  const color = getComputedStyle(drop).getPropertyValue('flood-color') || 'rgb(0, 0, 0)'
  const opacity = parseFloat(getComputedStyle(drop).getPropertyValue('flood-opacity') || '1')
  return {
    dx: num(drop, 'dx', 2),
    dy: num(drop, 'dy', 2),
    blur: num(drop, 'stdDeviation', 2) * 2,
    color: withAlpha(color, opacity),
  }
}

/** Builds the paint for fill/stroke values like url(#id) or a color. */
function paintFor(
  ctx: CanvasRenderingContext2D,
  value: string,
  opacity: number,
  root: SVGSVGElement,
): { style: string | CanvasGradient; bbox: boolean; gradient?: Element } | null {
  if (!value || value === 'none') return null
  const id = urlId(value)
  if (!id) return { style: withAlpha(value, opacity), bbox: false }
  const gradient = root.querySelector(`[id="${CSS.escape(id)}"]`)
  if (!gradient) return null
  const bbox = gradient.getAttribute('gradientUnits') !== 'userSpaceOnUse'
  let canvasGradient: CanvasGradient
  if (gradient.tagName === 'radialGradient') {
    const cx = num(gradient, 'cx', 0.5)
    const cy = num(gradient, 'cy', 0.5)
    const r = num(gradient, 'r', 0.5)
    canvasGradient = ctx.createRadialGradient(
      num(gradient, 'fx', cx),
      num(gradient, 'fy', cy),
      0,
      cx,
      cy,
      r,
    )
  } else {
    canvasGradient = ctx.createLinearGradient(
      num(gradient, 'x1', 0),
      num(gradient, 'y1', 0),
      num(gradient, 'x2', 1),
      num(gradient, 'y2', 0),
    )
  }
  gradient.querySelectorAll('stop').forEach((stop) => {
    const style = getComputedStyle(stop)
    const stopOpacity = parseFloat(style.getPropertyValue('stop-opacity') || '1')
    canvasGradient.addColorStop(
      Math.min(1, Math.max(0, num(stop, 'offset', 0))),
      withAlpha(style.getPropertyValue('stop-color') || 'rgb(0, 0, 0)', stopOpacity * opacity),
    )
  })
  return { style: canvasGradient, bbox, gradient }
}

function shapePath(el: SVGGraphicsElement): Path2D | null {
  const path = new Path2D()
  switch (el.tagName) {
    case 'path':
      return new Path2D(el.getAttribute('d') ?? '')
    case 'rect': {
      const x = num(el, 'x', 0)
      const y = num(el, 'y', 0)
      const w = num(el, 'width', 0)
      const h = num(el, 'height', 0)
      const r = Math.min(num(el, 'rx', num(el, 'ry', 0)), w / 2, h / 2)
      if (w <= 0 || h <= 0) return null
      path.moveTo(x + r, y)
      path.arcTo(x + w, y, x + w, y + h, r)
      path.arcTo(x + w, y + h, x, y + h, r)
      path.arcTo(x, y + h, x, y, r)
      path.arcTo(x, y, x + w, y, r)
      path.closePath()
      return path
    }
    case 'circle':
      path.arc(num(el, 'cx', 0), num(el, 'cy', 0), num(el, 'r', 0), 0, Math.PI * 2)
      return path
    case 'ellipse':
      path.ellipse(
        num(el, 'cx', 0),
        num(el, 'cy', 0),
        num(el, 'rx', 0),
        num(el, 'ry', 0),
        0,
        0,
        Math.PI * 2,
      )
      return path
    case 'line':
      path.moveTo(num(el, 'x1', 0), num(el, 'y1', 0))
      path.lineTo(num(el, 'x2', 0), num(el, 'y2', 0))
      return path
    default:
      return null
  }
}

export async function paintSvg(svg: SVGSVGElement, ctx: CanvasRenderingContext2D) {
  const rootInverse = svg.getScreenCTM()?.inverse()
  if (!rootInverse) throw new Error('svg not rendered')

  // Preload images and fonts used by the sticker.
  const images = new Map<string, HTMLImageElement>()
  for (const image of Array.from(svg.querySelectorAll('image'))) {
    const href = image.getAttribute('href') ?? image.getAttribute('xlink:href')
    if (href && !images.has(href)) images.set(href, await loadImage(href))
  }
  const fontOf = (style: CSSStyleDeclaration) =>
    `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
  const fonts = new Set<string>()
  svg.querySelectorAll('text, tspan').forEach((el) => fonts.add(fontOf(getComputedStyle(el))))
  await Promise.all([...fonts].map((font) => document.fonts.load(font).catch(() => [])))
  await document.fonts.ready

  const setMatrix = (el: SVGGraphicsElement) => {
    const screen = el.getScreenCTM()
    if (!screen) return false
    const m = rootInverse.multiply(screen)
    ctx.setTransform(m.a, m.b, m.c, m.d, m.e, m.f)
    // Canvas shadows ignore the transform; scale them like the SVG filter would be.
    shadowScale = Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) || 1
    return true
  }
  let shadowScale = 1

  const applyShadow = (shadow: Shadow) => {
    ctx.shadowColor = shadow ? shadow.color : 'transparent'
    ctx.shadowBlur = shadow ? shadow.blur * shadowScale : 0
    ctx.shadowOffsetX = shadow ? shadow.dx * shadowScale : 0
    ctx.shadowOffsetY = shadow ? shadow.dy * shadowScale : 0
  }

  const fillOrStroke = (
    el: SVGGraphicsElement,
    path: Path2D,
    opacity: number,
    mode: 'fill' | 'stroke',
  ) => {
    const style = getComputedStyle(el)
    const value = mode === 'fill' ? style.fill : style.stroke
    const partOpacity = parseFloat(mode === 'fill' ? style.fillOpacity : style.strokeOpacity) || 0
    const paint = paintFor(ctx, value, partOpacity * opacity, svg)
    if (!paint) return
    ctx.save()
    if (mode === 'stroke') {
      ctx.lineWidth = parseFloat(style.strokeWidth) || 1
      ctx.lineCap = (style.strokeLinecap as CanvasLineCap) || 'butt'
      ctx.lineJoin = (style.strokeLinejoin as CanvasLineJoin) || 'miter'
    }
    let target = path
    if (paint.bbox && paint.gradient) {
      // objectBoundingBox gradient: paint in the unit square of the element's bbox.
      const box = el.getBBox()
      if (box.width === 0 || box.height === 0) {
        ctx.restore()
        return
      }
      ctx.transform(box.width, 0, 0, box.height, box.x, box.y)
      target = new Path2D()
      target.addPath(
        path,
        new DOMMatrix([
          1 / box.width,
          0,
          0,
          1 / box.height,
          -box.x / box.width,
          -box.y / box.height,
        ]),
      )
      if (mode === 'stroke') ctx.lineWidth /= Math.max(box.width, box.height)
    }
    if (mode === 'fill') {
      ctx.fillStyle = paint.style
      ctx.fill(target, (style.fillRule as CanvasFillRule) || 'nonzero')
    } else {
      ctx.strokeStyle = paint.style
      ctx.stroke(target)
    }
    ctx.restore()
  }

  const drawText = (el: SVGTextElement, opacity: number) => {
    const base = getComputedStyle(el)
    const runs: { text: string; style: CSSStyleDeclaration }[] = []
    el.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) runs.push({ text: node.textContent ?? '', style: base })
      else if (node instanceof SVGTSpanElement)
        runs.push({ text: node.textContent ?? '', style: getComputedStyle(node) })
    })
    const spacingOf = (style: CSSStyleDeclaration) =>
      style.letterSpacing === 'normal' ? 0 : parseFloat(style.letterSpacing) || 0
    const widthOf = (run: (typeof runs)[number]) => {
      ctx.font = fontOf(run.style)
      return ctx.measureText(run.text).width + spacingOf(run.style) * [...run.text].length
    }
    const total = runs.reduce((sum, run) => sum + widthOf(run), 0)
    const anchor = base.textAnchor
    let x = num(el, 'x', 0) - (anchor === 'middle' ? total / 2 : anchor === 'end' ? total : 0)
    const y = num(el, 'y', 0)
    ctx.textBaseline = 'alphabetic'
    ctx.textAlign = 'left'
    for (const run of runs) {
      const paint = paintFor(
        ctx,
        run.style.fill,
        (parseFloat(run.style.fillOpacity) || 0) * opacity,
        svg,
      )
      ctx.font = fontOf(run.style)
      const spacing = spacingOf(run.style)
      if (paint) ctx.fillStyle = paint.style
      if (spacing && 'letterSpacing' in ctx) {
        ;(ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
          `${spacing}px`
        if (paint) ctx.fillText(run.text, x, y)
        ;(ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px'
        x += ctx.measureText(run.text).width + spacing * [...run.text].length
      } else if (spacing) {
        for (const char of run.text) {
          if (paint) ctx.fillText(char, x, y)
          x += ctx.measureText(char).width + spacing
        }
      } else {
        if (paint) ctx.fillText(run.text, x, y)
        x += ctx.measureText(run.text).width
      }
    }
  }

  const drawImage = (el: SVGImageElement, opacity: number) => {
    const href = el.getAttribute('href') ?? el.getAttribute('xlink:href') ?? ''
    const image = images.get(href)
    if (!image) return
    const x = num(el, 'x', 0)
    const y = num(el, 'y', 0)
    const w = num(el, 'width', image.width)
    const h = num(el, 'height', image.height)
    const scale = Math.min(w / image.width, h / image.height)
    const dw = image.width * scale
    const dh = image.height * scale
    const align = el.getAttribute('preserveAspectRatio') ?? 'xMidYMid meet'
    const dx = align.startsWith('xMin')
      ? x
      : align.startsWith('xMax')
        ? x + w - dw
        : x + (w - dw) / 2
    const dy = align.includes('YMin') ? y : align.includes('YMax') ? y + h - dh : y + (h - dh) / 2
    ctx.globalAlpha = opacity
    ctx.drawImage(image, dx, dy, dw, dh)
    ctx.globalAlpha = 1
  }

  const walk = (parent: Element, opacity: number, shadow: Shadow) => {
    for (const child of Array.from(parent.children)) {
      if (SKIP.has(child.tagName)) continue
      const style = getComputedStyle(child)
      if (style.display === 'none' || style.visibility === 'hidden') continue
      const ownOpacity = opacity * (parseFloat(style.opacity) || 0)
      if (ownOpacity <= 0) continue
      const ownShadow = shadowOf(child, svg) ?? shadow
      if (child.tagName === 'g' || child.tagName === 'svg') {
        walk(child, ownOpacity, ownShadow)
        continue
      }
      if (!(child instanceof SVGGraphicsElement) || !setMatrix(child)) continue
      applyShadow(ownShadow)
      if (child instanceof SVGTextElement) drawText(child, ownOpacity)
      else if (child instanceof SVGImageElement) drawImage(child, ownOpacity)
      else {
        const path = shapePath(child)
        if (!path) continue
        if (child.tagName !== 'line') fillOrStroke(child, path, ownOpacity, 'fill')
        fillOrStroke(child, path, ownOpacity, 'stroke')
      }
    }
  }

  ctx.save()
  walk(svg, 1, null)
  ctx.restore()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
}
