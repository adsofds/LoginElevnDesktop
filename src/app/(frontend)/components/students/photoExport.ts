/**
 * "Antes e depois" export, drawn on a canvas in the browser and saved as PNG.
 * Each template is a plain function so the final layouts from Lunaris can replace
 * these drafts without touching the student file.
 */

export type ExportPhoto = { url: string; date: string; weight?: string; label: string }

export type ExportInput = {
  before: ExportPhoto
  after: ExportPhoto
  studentName: string
  accent: string
}

export type ExportTemplate = {
  id: 'simples' | 'social'
  label: string
  description: string
  draw: (input: ExportInput) => Promise<HTMLCanvasElement>
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    // Remote photos (CDN) must allow CORS, or the canvas can't be exported.
    if (!url.startsWith('data:') && !url.startsWith('blob:')) image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Não foi possível carregar a foto: ${url}`))
    image.src = url
  })
}

/** Draws `image` covering the box (like object-fit: cover). */
function drawCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  radius = 0,
) {
  const scale = Math.max(width / image.width, height / image.height)
  const sw = width / scale
  const sh = height / scale
  const sx = (image.width - sw) / 2
  const sy = (image.height - sh) / 2
  ctx.save()
  if (radius) {
    ctx.beginPath()
    ctx.roundRect(x, y, width, height, radius)
    ctx.clip()
  }
  ctx.drawImage(image, sx, sy, sw, sh, x, y, width, height)
  ctx.restore()
}

const font = (weight: number, size: number) =>
  `${weight} ${size}px Figtree, system-ui, -apple-system, sans-serif`

/** (a) Simple: the two photos side by side with their dates. 1600 × 1200. */
async function drawSimple({ before, after }: ExportInput) {
  const [a, b] = await Promise.all([loadImage(before.url), loadImage(after.url)])
  const canvas = document.createElement('canvas')
  canvas.width = 1600
  canvas.height = 1200
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  drawCover(ctx, a, 0, 0, 800, 1060)
  drawCover(ctx, b, 800, 0, 800, 1060)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(798, 0, 4, 1060)
  ctx.fillStyle = '#17142c'
  ctx.textBaseline = 'middle'
  ;[before, after].forEach((photo, index) => {
    const x = index * 800 + 40
    ctx.font = font(700, 34)
    ctx.fillText(`${photo.label} · ${photo.date}`, x, 1112)
    if (photo.weight) {
      ctx.font = font(500, 26)
      ctx.fillStyle = '#5b5870'
      ctx.fillText(photo.weight, x, 1156)
      ctx.fillStyle = '#17142c'
    }
  })
  return canvas
}

/** (b) Social: 1080 × 1350 (4:5 Instagram) with the Elevn mark, dates and the student's name. */
async function drawSocial({ before, after, studentName, accent }: ExportInput) {
  const [a, b] = await Promise.all([loadImage(before.url), loadImage(after.url)])
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 1350
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#121026'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#efe6d2'
  ctx.textBaseline = 'alphabetic'
  ctx.font = font(600, 44)
  ctx.fillText('elevn', 64, 116)
  ctx.font = font(500, 26)
  ctx.fillStyle = 'rgba(239,230,210,0.7)'
  ctx.textAlign = 'right'
  ctx.fillText('CONSULTORIA', 1016, 112)
  ctx.textAlign = 'left'

  const top = 170
  const width = 462
  const height = 840
  drawCover(ctx, a, 64, top, width, height, 28)
  drawCover(ctx, b, 64 + width + 28, top, width, height, 28)

  ;[before, after].forEach((photo, index) => {
    const x = 64 + index * (width + 28)
    ctx.fillStyle = 'rgba(18,16,38,0.72)'
    ctx.beginPath()
    ctx.roundRect(x + 20, top + 20, 150, 52, 26)
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    ctx.font = font(700, 26)
    ctx.fillText(photo.label.toUpperCase(), x + 44, top + 56)
    ctx.fillStyle = 'rgba(239,230,210,0.85)'
    ctx.font = font(500, 28)
    ctx.fillText(photo.date, x, top + height + 54)
  })

  ctx.fillStyle = accent
  ctx.fillRect(64, 1112, 72, 6)
  ctx.fillStyle = '#ffffff'
  ctx.font = font(700, 58)
  ctx.fillText(studentName || 'Sua evolução', 64, 1200)
  ctx.fillStyle = 'rgba(239,230,210,0.7)'
  ctx.font = font(500, 30)
  ctx.fillText('Evolução acompanhada pela Elevn', 64, 1254)
  return canvas
}

export const exportTemplates: ExportTemplate[] = [
  {
    id: 'simples',
    label: 'Simples com datas',
    description: 'Lado a lado, data e peso de cada foto',
    draw: drawSimple,
  },
  {
    id: 'social',
    label: 'Para redes sociais',
    description: '1080 × 1350 com a marca Elevn e o nome do aluno',
    draw: drawSocial,
  },
]

export async function downloadComparison(
  template: ExportTemplate,
  input: ExportInput,
  fileName: string,
) {
  const canvas = await template.draw(input)
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) throw new Error('Não foi possível gerar a imagem.')
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
