// Generates public/og-image.png (1200x630) and public/apple-touch-icon.png (180x180)
// using only Node built-ins (zlib). No external dependencies.
// Design: dark surface, gold roulette ring with tick marks, cyan inner ring,
// subtle radial glow - matches the League Roulette brand tokens.
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

// ---- CRC32 (required for PNG chunks) ----
const crcTable = (() => {
  const t = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return t
})()
function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeBuf = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
  return Buffer.concat([len, typeBuf, data, crc])
}
function encodePNG(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type: RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0 // filter: none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4)
  }
  const idat = zlib.deflateSync(raw, { level: 9 })
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))])
}

// ---- drawing helpers ----
function makeCanvas(w, h) {
  return { w, h, px: Buffer.alloc(w * h * 4) }
}
function setPx(c, x, y, r, g, b, a) {
  if (x < 0 || y < 0 || x >= c.w || y >= c.h) return
  const i = (y * c.w + x) * 4
  if (a === 1) {
    c.px[i] = r; c.px[i + 1] = g; c.px[i + 2] = b; c.px[i + 3] = 255
    return
  }
  const dstA = c.px[i + 3] / 255
  const outA = a + dstA * (1 - a)
  if (outA === 0) return
  c.px[i] = Math.round((r * a + c.px[i] * dstA * (1 - a)) / outA)
  c.px[i + 1] = Math.round((g * a + c.px[i + 1] * dstA * (1 - a)) / outA)
  c.px[i + 2] = Math.round((b * a + c.px[i + 2] * dstA * (1 - a)) / outA)
  c.px[i + 3] = Math.round(outA * 255)
}
function fillRect(c, x0, y0, x1, y1, r, g, b, a) {
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) setPx(c, x, y, r, g, b, a)
}
// Circle with soft edge (alpha ramp over `soft` px)
function ring(c, cx, cy, radius, thickness, color, soft = 1.5) {
  const [r, g, b] = color
  const min = Math.max(0, Math.floor(radius - thickness / 2 - soft))
  const max = Math.min(Math.min(c.w, c.h) - 1, Math.ceil(radius + thickness / 2 + soft))
  for (let y = min; y <= max; y++) {
    for (let x = min; x <= max; x++) {
      const dx = x - cx
      const dy = y - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      const d = Math.abs(dist - radius)
      const a = d <= thickness / 2 ? 1 : Math.max(0, 1 - (d - thickness / 2) / soft)
      if (a > 0) setPx(c, x, y, r, g, b, a)
    }
  }
}
function disc(c, cx, cy, radius, color, soft = 1.5) {
  const [r, g, b] = color
  for (let y = Math.max(0, Math.floor(cy - radius - soft)); y <= Math.min(c.h - 1, Math.ceil(cy + radius + soft)); y++) {
    for (let x = Math.max(0, Math.floor(cx - radius - soft)); x <= Math.min(c.w - 1, Math.ceil(cx + radius + soft)); x++) {
      const dx = x - cx
      const dy = y - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < radius - soft) setPx(c, x, y, r, g, b, 1)
      else if (dist <= radius) setPx(c, x, y, r, g, b, (radius - dist) / soft)
    }
  }
}
// Radial glow (additive-ish soft blend)
function glow(c, cx, cy, radius, color, strength) {
  const [r, g, b] = color
  for (let y = Math.max(0, Math.floor(cy - radius)); y <= Math.min(c.h - 1, Math.ceil(cy + radius)); y++) {
    for (let x = Math.max(0, Math.floor(cx - radius)); x <= Math.min(c.w - 1, Math.ceil(cx + radius)); x++) {
      const dx = x - cx
      const dy = y - cy
      const d = Math.sqrt(dx * dx + dy * dy) / radius
      if (d >= 1) continue
      const a = Math.pow(1 - d, 2.2) * strength
      if (a > 0.004) setPx(c, x, y, r, g, b, a)
    }
  }
}
// Diagonal scanlines (very subtle, matches the site texture)
function scanlines(c, spacing, alpha) {
  for (let y = 0; y < c.h; y += spacing) fillRect(c, 0, y, c.w, y + 1, 0, 0, 0, alpha)
}

const GOLD = [200, 155, 60]
const GOLD_DIM = [138, 107, 42]
const CYAN = [0, 229, 255]
const BG = [5, 5, 10]

function buildOgImage() {
  const w = 1200
  const h = 630
  const c = makeCanvas(w, h)
  fillRect(c, 0, 0, w, h, BG[0], BG[1], BG[2], 1)

  // ambient glows
  glow(c, w * 0.72, h * 0.42, 420, GOLD, 0.14)
  glow(c, w * 0.25, h * 0.85, 380, [0, 122, 138], 0.12)

  // roulette ring, right of center
  const cx = w * 0.72
  const cy = h * 0.42
  ring(c, cx, cy, 190, 10, GOLD, 2)
  ring(c, cx, cy, 190, 3, [255, 214, 130], 1)
  ring(c, cx, cy, 148, 3, CYAN, 1.5)
  disc(c, cx, cy, 96, [10, 10, 18], 2)
  glow(c, cx, cy, 96, GOLD, 0.18)

  // tick marks around the main ring
  const ticks = 24
  for (let i = 0; i < ticks; i++) {
    const ang = (i / ticks) * Math.PI * 2
    const major = i % 6 === 0
    const r0 = major ? 165 : 172
    const r1 = major ? 215 : 207
    const x0 = cx + Math.cos(ang) * r0
    const y0 = cy + Math.sin(ang) * r0
    const x1 = cx + Math.cos(ang) * r1
    const y1 = cy + Math.sin(ang) * r1
    const len = Math.hypot(x1 - x0, y1 - y0)
    const steps = Math.ceil(len * 2)
    for (let s = 0; s <= steps; s++) {
      const t = s / steps
      setPx(c, Math.round(x0 + (x1 - x0) * t), Math.round(y0 + (y1 - y0) * t), major ? 200 : 138, major ? 155 : 107, major ? 60 : 42, major ? 1 : 0.7)
    }
  }

  // pointer ball on the ring
  disc(c, cx + Math.cos(-Math.PI / 2.4) * 190, cy + Math.sin(-Math.PI / 2.4) * 190, 12, [255, 236, 190])

  // left side: brand block (abstract, no text)
  const lx = w * 0.22
  const ly = h * 0.4
  // three stacked bars, gold / dim / cyan
  fillRect(c, lx - 130, ly - 84, lx + 40, ly - 66, GOLD[0], GOLD[1], GOLD[2], 1)
  fillRect(c, lx - 130, ly - 44, lx + 150, ly - 30, 138, 107, 42, 0.9)
  fillRect(c, lx - 130, ly - 6, lx + 80, ly + 8, CYAN[0], CYAN[1], CYAN[2], 0.85)
  // underline trace
  fillRect(c, lx - 130, ly + 48, lx + 210, ly + 52, GOLD[0], GOLD[1], GOLD[2], 0.35)

  // corner frame accents
  fillRect(c, 36, 36, 38, 120, GOLD[0], GOLD[1], GOLD[2], 0.5)
  fillRect(c, 36, 36, 120, 38, GOLD[0], GOLD[1], GOLD[2], 0.5)
  fillRect(c, w - 120, h - 38, w - 36, h - 36, GOLD[0], GOLD[1], GOLD[2], 0.5)
  fillRect(c, w - 38, h - 120, w - 36, h - 36, GOLD[0], GOLD[1], GOLD[2], 0.5)

  scanlines(c, 4, 0.03)
  return encodePNG(w, h, c.px)
}

function buildAppleIcon() {
  const w = 180
  const h = 180
  const c = makeCanvas(w, h)
  fillRect(c, 0, 0, w, h, 8, 8, 14, 1)
  glow(c, w / 2, h / 2, 95, GOLD, 0.22)
  ring(c, w / 2, h / 2, 62, 10, GOLD, 2)
  ring(c, w / 2, h / 2, 44, 3, CYAN, 1.5)
  disc(c, w / 2, h / 2, 26, [12, 12, 20], 2)
  // tick marks
  for (let i = 0; i < 16; i++) {
    const ang = (i / 16) * Math.PI * 2
    const x0 = w / 2 + Math.cos(ang) * 52
    const y0 = h / 2 + Math.sin(ang) * 52
    const x1 = w / 2 + Math.cos(ang) * 57
    const y1 = h / 2 + Math.sin(ang) * 57
    const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2)
    for (let s = 0; s <= steps; s++) {
      const t = s / steps
      setPx(c, Math.round(x0 + (x1 - x0) * t), Math.round(y0 + (y1 - y0) * t), 138, 107, 42, 0.9)
    }
  }
  disc(c, w / 2 + 62 * Math.cos(-Math.PI / 2.6), h / 2 + 62 * Math.sin(-Math.PI / 2.6), 6, [255, 236, 190])
  return encodePNG(w, h, c.px)
}

const outDir = path.join(__dirname, '..', 'public')
fs.writeFileSync(path.join(outDir, 'og-image.png'), buildOgImage())
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), buildAppleIcon())
console.log('wrote public/og-image.png and public/apple-touch-icon.png')
