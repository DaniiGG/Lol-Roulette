import { championIconUrl } from '@/lib/champion-data'
import type { ExplorerMode, ExplorerRole } from './explorer-types'
import { ROLE_COLORS, getLevelStyle } from './visuals'

export interface ShareCardChampion {
  key: string
  name: string
  points: number | null
  level: number | null
  role: ExplorerRole
}

export interface ShareCardData {
  mode: ExplorerMode
  locale: string
  title: string
  subtitle: string
  modeLabel: string
  modeBadge: string
  root: ShareCardChampion | null
  champions: ShareCardChampion[]
  roleLabels: Record<ExplorerRole, string>
  disclaimer: string
  url: string
  pointsLabel: string
  levelLabel: string
}

const WIDTH = 1200
const HEIGHT = 630

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const safe = Math.min(radius, width / 2, height / 2)
  context.beginPath()
  context.moveTo(x + safe, y)
  context.arcTo(x + width, y, x + width, y + height, safe)
  context.arcTo(x + width, y + height, x, y + height, safe)
  context.arcTo(x, y + height, x, y, safe)
  context.arcTo(x, y, x + width, y, safe)
  context.closePath()
}

function formatPoints(locale: string, points: number | null) {
  if (points === null) return ''
  return new Intl.NumberFormat(locale).format(points)
}

function drawText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  size: number,
  color: string,
  weight = '600',
  font = '"Outfit", sans-serif',
) {
  context.save()
  context.font = `${weight} ${size}px ${font}`
  context.fillStyle = color
  context.textBaseline = 'middle'
  let output = text
  if (context.measureText(output).width > maxWidth) {
    while (output.length > 1 && context.measureText(`${output}...`).width > maxWidth) {
      output = output.slice(0, -1)
    }
    output = `${output}...`
  }
  context.fillText(output, x, y)
  context.restore()
}

function wrapTitle(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  size: number,
) {
  context.save()
  context.font = `400 ${size}px "Bebas Neue", sans-serif`
  const words = text.split(/\s+/)
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (current && context.measureText(next).width > maxWidth) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
  }

  if (current) lines.push(current)
  context.restore()
  return lines.slice(0, 3)
}

async function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = url
  })
}

function drawChampionCircle(
  context: CanvasRenderingContext2D,
  champion: ShareCardChampion,
  x: number,
  y: number,
  radius: number,
  image: HTMLImageElement | null,
  options: { showLevel?: boolean; ringWidth?: number } = {},
) {
  const role = ROLE_COLORS[champion.role]
  const level = getLevelStyle(champion.level)
  const ringWidth = options.ringWidth ?? 4

  context.save()
  context.beginPath()
  context.arc(x, y, radius + ringWidth + 7, 0, Math.PI * 2)
  context.fillStyle = role.soft
  context.fill()

  context.beginPath()
  context.arc(x, y, radius, 0, Math.PI * 2)
  context.clip()

  if (image) {
    context.drawImage(image, x - radius, y - radius, radius * 2, radius * 2)
  } else {
    const gradient = context.createLinearGradient(x - radius, y - radius, x + radius, y + radius)
    gradient.addColorStop(0, '#1b1430')
    gradient.addColorStop(1, '#08040f')
    context.fillStyle = gradient
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2)
    context.fillStyle = role.color
    context.font = `800 ${radius * 0.72}px "Outfit", sans-serif`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(champion.name.charAt(0).toUpperCase(), x, y)
  }

  context.restore()

  context.save()
  context.beginPath()
  context.arc(x, y, radius, 0, Math.PI * 2)
  context.strokeStyle = role.color
  context.lineWidth = ringWidth
  context.stroke()
  context.restore()

  if (options.showLevel && champion.level !== null) {
    const badge = Math.max(18, radius * 0.32)
    context.save()
    context.beginPath()
    context.arc(x + radius * 0.72, y + radius * 0.72, badge, 0, Math.PI * 2)
    context.fillStyle = '#08040f'
    context.fill()
    context.strokeStyle = level.color
    context.lineWidth = 2
    context.stroke()
    context.fillStyle = level.color
    context.font = `800 ${badge * 0.92}px "Outfit", sans-serif`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(String(champion.level), x + radius * 0.72, y + radius * 0.72 + 1)
    context.restore()
  }
}

export async function createShareCardBlob(data: ShareCardData): Promise<Blob> {
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    await document.fonts.ready.catch(() => undefined)
  }

  const canvas = document.createElement('canvas')
  canvas.width = WIDTH
  canvas.height = HEIGHT
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas is not available')

  const background = context.createLinearGradient(0, 0, WIDTH, HEIGHT)
  background.addColorStop(0, '#05030d')
  background.addColorStop(0.45, '#0a0718')
  background.addColorStop(1, '#060411')
  context.fillStyle = background
  context.fillRect(0, 0, WIDTH, HEIGHT)

  const goldGlow = context.createRadialGradient(930, 260, 20, 930, 260, 520)
  goldGlow.addColorStop(0, 'rgba(240, 199, 94, 0.2)')
  goldGlow.addColorStop(0.45, 'rgba(200, 155, 60, 0.06)')
  goldGlow.addColorStop(1, 'rgba(200, 155, 60, 0)')
  context.fillStyle = goldGlow
  context.fillRect(0, 0, WIDTH, HEIGHT)

  const violetGlow = context.createRadialGradient(180, 520, 20, 180, 520, 460)
  violetGlow.addColorStop(0, 'rgba(124, 58, 237, 0.18)')
  violetGlow.addColorStop(1, 'rgba(124, 58, 237, 0)')
  context.fillStyle = violetGlow
  context.fillRect(0, 0, WIDTH, HEIGHT)

  context.save()
  for (let index = 0; index < 90; index++) {
    const angle = index * 2.399963229728653
    const radius = Math.sqrt((index + 0.5) / 90) * 680
    const x = 930 + Math.cos(angle) * radius
    const y = 310 + Math.sin(angle) * radius
    const size = 0.8 + ((index * 37) % 11) / 9
    context.beginPath()
    context.arc(x, y, size, 0, Math.PI * 2)
    context.fillStyle =
      index % 13 === 0
        ? 'rgba(240, 199, 94, 0.52)'
        : index % 7 === 0
          ? 'rgba(79, 209, 239, 0.36)'
          : 'rgba(255, 255, 255, 0.28)'
    context.fill()
  }
  context.restore()

  context.save()
  context.strokeStyle = 'rgba(240, 199, 94, 0.12)'
  context.lineWidth = 1.4
  for (let index = 0; index < 9; index++) {
    context.beginPath()
    context.moveTo(930, 310)
    context.bezierCurveTo(
      780 + index * 18,
      220 - index * 8,
      1080 - index * 12,
      160 + index * 14,
      1160 - index * 18,
      70 + index * 28,
    )
    context.stroke()
  }
  context.restore()

  context.save()
  context.beginPath()
  context.arc(52, 52, 15, 0, Math.PI * 2)
  context.strokeStyle = '#f0c75e'
  context.lineWidth = 2
  context.stroke()
  context.beginPath()
  context.arc(52, 52, 6, 0, Math.PI * 2)
  context.fillStyle = '#f0c75e'
  context.fill()
  context.restore()

  drawText(context, 'LEAGUE ROULETTE', 80, 52, 300, 16, '#f0c75e', '700')
  drawText(
    context,
    data.modeLabel.toUpperCase(),
    80,
    74,
    320,
    10,
    'rgba(255,255,255,0.38)',
    '600',
  )

  context.save()
  roundRect(context, 1032, 36, 132, 32, 16)
  context.fillStyle = 'rgba(240, 199, 94, 0.07)'
  context.fill()
  context.strokeStyle = 'rgba(240, 199, 94, 0.32)'
  context.lineWidth = 1
  context.stroke()
  context.restore()
  drawText(context, data.modeBadge.toUpperCase(), 1098, 52, 106, 10, '#f0c75e', '700')

  context.save()
  context.font = '400 64px "Bebas Neue", sans-serif'
  const titleLines = wrapTitle(context, data.title, 620, 64)
  context.fillStyle = '#fff8e6'
  context.textBaseline = 'top'
  titleLines.forEach((line, index) => {
    context.fillText(line, 70, 132 + index * 58)
  })
  context.restore()

  const titleHeight = titleLines.length * 58
  drawText(
    context,
    data.subtitle,
    72,
    132 + titleHeight + 30,
    600,
    20,
    'rgba(255,255,255,0.62)',
    '400',
  )

  const root = data.root
  if (root) {
    const rootImage = await loadImage(championIconUrl(root.key))
    drawChampionCircle(context, root, 930, 300, 132, rootImage, {
      showLevel: true,
      ringWidth: 5,
    })
    drawText(context, root.name, 930, 464, 300, 26, '#fff4cf', '700')
    drawText(
      context,
      `${root.level !== null ? `${data.levelLabel} ${root.level} \u00b7 ` : ''}${data.roleLabels[root.role]}${root.points !== null ? ` \u00b7 ${formatPoints(data.locale, root.points)} ${data.pointsLabel}` : ''}`,
      930,
      492,
      330,
      14,
      'rgba(255,255,255,0.46)',
      '500',
    )
  }

  const others = data.champions.filter(
    (champion) => !root || champion.key !== root.key,
  ).slice(0, root ? 5 : 5)

  const images = await Promise.all(
    others.map((champion) => loadImage(championIconUrl(champion.key))),
  )

  const rowY = root ? 552 : 388
  const rowStart = root ? 90 : 100
  const spacing = root ? 118 : 190
  const radius = root ? 40 : 64

  others.forEach((champion, index) => {
    const x = rowStart + index * spacing + radius
    if (x + radius > 760) return
    drawChampionCircle(context, champion, x, rowY, radius, images[index], {
      showLevel: champion.level !== null,
      ringWidth: 3,
    })
    drawText(context, champion.name, x, rowY + radius + 20, spacing - 12, 12, 'rgba(255,255,255,0.8)', '600')
    if (champion.points !== null) {
      drawText(
        context,
        `${formatPoints(data.locale, champion.points)} ${data.pointsLabel}`,
        x,
        rowY + radius + 38,
        spacing - 12,
        10,
        'rgba(255,255,255,0.4)',
        '500',
      )
    }
  })

  context.save()
  const footerLine = context.createLinearGradient(70, 0, 1130, 0)
  footerLine.addColorStop(0, 'rgba(240, 199, 94, 0.35)')
  footerLine.addColorStop(0.55, 'rgba(255,255,255,0.08)')
  footerLine.addColorStop(1, 'rgba(240, 199, 94, 0)')
  context.fillStyle = footerLine
  context.fillRect(70, 604, 1060, 1)
  context.restore()

  drawText(context, data.url, 70, 620, 520, 12, 'rgba(255,255,255,0.42)', '500')
  context.save()
  context.font = '500 11px "Outfit", sans-serif'
  context.fillStyle = 'rgba(255,255,255,0.3)'
  context.textAlign = 'right'
  context.textBaseline = 'middle'
  context.fillText(data.disclaimer, 1130, 620, 560)
  context.restore()

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Could not export the share card'))
    }, 'image/png')
  })
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
