import QRCode from 'qrcode'
import fs from 'fs'
import { createCanvas } from 'canvas'

const url = 'https://lucky-maamoul-37ddd8.netlify.app/'
const qrSize = 400

// QRコードをcanvasに描画
const canvas = createCanvas(qrSize, qrSize)
await QRCode.toCanvas(canvas, url, {
  width: qrSize,
  margin: 2,
  errorCorrectionLevel: 'H',
})

// テキストを中央に描画
const ctx = canvas.getContext('2d')

// テキストの背景（白い角丸四角）
const text = 'NS_SLITTER'
const fontSize = qrSize * 0.10  // フォントサイズ
const textWidth = qrSize * 0.65  // テキスト背景の横幅 ← ここで横幅変更
const textHeight = fontSize + 12
const textX = (qrSize - textWidth) / 2
const textY = (qrSize - textHeight) / 2

// 白背景
ctx.fillStyle = '#ffffff'
ctx.beginPath()
ctx.roundRect(textX - 4, textY - 4, textWidth + 8, textHeight + 8, 6)
ctx.fill()

// 赤文字
ctx.fillStyle = '#ff0000'
ctx.font = `900 ${fontSize}px sans-serif`
ctx.textAlign = 'center'
ctx.textBaseline = 'middle'
ctx.fillText(text, qrSize / 2, qrSize / 2)

// PNGとして保存
const buffer = canvas.toBuffer('image/png')
fs.writeFileSync('qrcode.png', buffer)
fs.writeFileSync('qrcode-url.txt', `QRコードのURL: ${url}\n`)

console.log('QRコードを生成しました！')
console.log(`URL: ${url}`)