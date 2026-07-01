import QRCode from 'qrcode'
import sharp from 'sharp'
import fs from 'fs'

const url = 'https://lucky-maamoul-37ddd8.netlify.app/'
const qrSize = 500

// ─── 調整パラメータ ────────────────────────────────────────
const qrColor = '#2f356eff'
const logoAreaW = Math.floor(qrSize * 0.38)  // ロゴ幅（QR幅の38%）
const padding = 12                           // 白背景の余白

// ─── 1. QRコードをPNGバッファで生成 ──────────────────────
const qrBuffer = await QRCode.toBuffer(url, {
  width: qrSize,
  margin: 2,
  errorCorrectionLevel: 'H',
  color: { dark: qrColor, light: '#ffffff' },
})

// ─── 2. NS SLITTERロゴをリサイズ ─────────────────────────
const resizeLogo = async (path, targetW) => {
  const meta = await sharp(path).metadata()
  const ratio = targetW / meta.width
  return sharp(path)
    .resize(targetW, Math.round(meta.height * ratio))
    .png()
    .toBuffer()
}

const logoNsBuf  = await resizeLogo('./public/anniversary_logo_black_ns_slitter.png', logoAreaW)
const logoNsMeta = await sharp(logoNsBuf).metadata()

// ─── 3. 白背景（角丸）を作ってロゴを乗せる ───────────────
const bgW = logoAreaW + padding * 2
const bgH = logoNsMeta.height + padding * 2
const roundedBg = Buffer.from(
  `<svg width="${bgW}" height="${bgH}">
    <rect x="0" y="0" width="${bgW}" height="${bgH}" rx="10" ry="10" fill="#2f356e"/>
  </svg>`
)

const logoPanelBuf = await sharp(roundedBg)
  .composite([{ input: logoNsBuf, left: padding, top: padding }])
  .png()
  .toBuffer()

// ─── 4. QRの中央にロゴパネルを合成 ──────────────────────
const x = Math.floor((qrSize - bgW) / 2)
const y = Math.floor((qrSize - bgH) / 2)

const result = await sharp(qrBuffer)
  .composite([{ input: logoPanelBuf, left: x, top: y }])
  .png()
  .toBuffer()

// ─── 5. 保存 ──────────────────────────────────────────────
fs.writeFileSync('qrcode.png', result)
fs.writeFileSync('qrcode-url.txt', `QRコードのURL: ${url}\n`)

console.log('QRコードを生成しました！')
console.log(`URL: ${url}`)
