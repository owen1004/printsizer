// 圖片解析度分析核心邏輯
// 全程在瀏覽器端執行，圖片不上傳伺服器（符合 CONSTITUTION.md 第 5 條）

export interface ImageInfo {
  width: number
  height: number
  fileSize: number
  fileName: string
  fileType: string
  quality: 'excellent' | 'good' | 'fair' | 'low' | 'poor'
  qualityLabel: string
  maxPrintSizes: PrintSize[]
  dpiLevels: DpiLevel[]
  aspectRatio: { w: number; h: number }
}

export interface PrintSize {
  name: string
  desc: string    // 台灣常見用途說明
  width: number   // cm
  height: number  // cm
  dpi: number     // 此圖在此尺寸實際可達 DPI
  printQuality: 'excellent' | 'good' | 'fair' | 'acceptable' | 'poor'
  canPrint: boolean  // dpi >= 該尺寸 minDpi（印刷實務門檻，按觀看距離分層）
}

export interface DpiLevel {
  dpi: number
  widthCm: number
  heightCm: number
  label: string
  labelText: string
}

// 台灣常見印刷品尺寸（由小到大）
// minDpi：印刷廠老闆視角的「實務可印門檻」，按觀看距離調整
//   - 名片/DM/明信片：手持 30cm 內近看，需 200 DPI
//   - A5/A4 傳單：閱讀距離 50cm，需 150 DPI
//   - A3 海報：店面 1m 距離，120 DPI
//   - A2/A1 海報/易拉展：2m 以上遠距，門檻可大幅放寬
const PRINT_SIZES: { name: string; desc: string; w: number; h: number; minDpi: number }[] = [
  { name: '名片',     desc: '標準名片',         w:  9,    h:  5.4,  minDpi: 200 },
  { name: 'DM 卡片',  desc: '促銷卡・小型 DM',  w: 10,    h: 15,    minDpi: 200 },
  { name: 'A6 明信片',desc: '明信片・小傳單',   w: 10.5,  h: 14.8,  minDpi: 200 },
  { name: 'A5 傳單',  desc: '對折傳單・小海報', w: 14.8,  h: 21,    minDpi: 150 },
  { name: 'A4 傳單',  desc: '最常見傳單尺寸',   w: 21,    h: 29.7,  minDpi: 150 },
  { name: 'A3 海報',  desc: '店面張貼・宣傳海報',w: 29.7, h: 42,    minDpi: 120 },
  { name: 'A2 海報',  desc: '展覽海報・活動宣傳',w: 42,   h: 59.4,  minDpi: 100 },
  { name: 'A1 海報',  desc: '大型活動・展場廣告',w: 59.4, h: 84.1,  minDpi:  75 },
  { name: '易拉展',   desc: 'X 架・展場立牌',   w: 80,    h: 200,   minDpi:  50 },
]

// DPI → 印刷品質等級（與 DPI 對照表一致）
function dpiToPrintQuality(dpi: number): PrintSize['printQuality'] {
  if (dpi >= 300) return 'excellent'
  if (dpi >= 150) return 'good'
  if (dpi >= 100) return 'fair'
  if (dpi >= 72)  return 'acceptable'
  return 'poor'
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

/**
 * 將像素比例化簡為「易讀的小數字」。
 * 先用 GCD 約分；若結果仍 > 30，用連分數逼近找最接近的分母 ≤ 30 的有理數。
 */
function niceRatio(w: number, h: number): { w: number; h: number } {
  const d = gcd(w, h)
  const rw = w / d
  const rh = h / d
  if (Math.max(rw, rh) <= 30) return { w: rw, h: rh }

  const ratio = w / h
  let bestW = rw, bestH = rh, bestErr = Infinity
  for (let denom = 1; denom <= 30; denom++) {
    const numer = Math.round(ratio * denom)
    if (numer === 0) continue
    const err = Math.abs(ratio - numer / denom)
    if (err < bestErr) { bestErr = err; bestW = numer; bestH = denom }
  }
  const g = gcd(bestW, bestH)
  return { w: bestW / g, h: bestH / g }
}

/**
 * 根據「實務上可印（canPrint=true）的最大尺寸」決定整體評級。
 * canPrint 已經是按尺寸觀看距離的實務門檻，這裡直接沿用，避免雙重標準。
 */
function getQuality(printSizes: PrintSize[]): ImageInfo['quality'] {
  const printable = printSizes.filter((s) => s.canPrint)
  if (printable.length === 0) return 'poor'

  const largest = printable[printable.length - 1] // 陣列已從小排到大

  // 對齊業界印刷實務：A4 傳單為一般使用門檻
  // - excellent：A3 以上海報水準
  // - good：A4 傳單水準
  // - fair：A5 小傳單水準
  // - low：只能印明信片/名片等小型印品
  // - poor：連名片都達不到 150 DPI
  const bigFormats   = ['A3 海報', 'A2 海報', 'A1 海報', '易拉展']
  const mediumFormat = 'A4 傳單'
  const fairFormat   = 'A5 傳單'
  const lowFormats   = ['A6 明信片', 'DM 卡片', '名片']

  if (bigFormats.includes(largest.name)) return 'excellent'
  if (largest.name === mediumFormat)     return 'good'
  if (largest.name === fairFormat)       return 'fair'
  if (lowFormats.includes(largest.name)) return 'low'
  return 'poor'
}

const QUALITY_LABELS: Record<ImageInfo['quality'], string> = {
  excellent: '優秀 — 可印大型海報（A3 以上）',
  good:      '良好 — 可印 A4 傳單',
  fair:      '尚可 — 適合 A5 小傳單',
  low:       '偏低 — 僅適合明信片・名片',
  poor:      '不足 — 建議換更高畫質圖片',
}

function calcPrintSizes(pixelWidth: number, pixelHeight: number): PrintSize[] {
  const CM_TO_INCH = 0.3937
  const longPx  = Math.max(pixelWidth, pixelHeight)
  const shortPx = Math.min(pixelWidth, pixelHeight)

  return PRINT_SIZES.map((size) => {
    const longCm  = Math.max(size.w, size.h)
    const shortCm = Math.min(size.w, size.h)

    // 等比縮放，取瓶頸軸的 DPI
    const dpiLong  = Math.round(longPx  / (longCm  * CM_TO_INCH))
    const dpiShort = Math.round(shortPx / (shortCm * CM_TO_INCH))
    const dpi      = Math.min(dpiLong, dpiShort)

    return {
      name: size.name,
      desc: size.desc,
      width: size.w,
      height: size.h,
      dpi,
      printQuality: dpiToPrintQuality(dpi),
      canPrint: dpi >= size.minDpi,   // 印刷實務門檻（按觀看距離分層）
    }
  })
}

function calcDpiLevels(pixelWidth: number, pixelHeight: number): DpiLevel[] {
  const CM_TO_INCH = 0.3937
  // 標籤改為觀看距離導向，跟 PRINT_SIZES 的 minDpi 邏輯對齊：
  //   300 = 極致（任何尺寸近看）／ 150 = 傳單水準（A4 門檻）
  //   100 = 海報水準（A2/A3 中距）／ 75 = 遠距水準（A1/易拉展）
  const levels = [
    { dpi: 300, label: 'extreme',    labelText: '極致品質' },
    { dpi: 150, label: 'excellent',  labelText: '傳單品質' },
    { dpi: 100, label: 'good',       labelText: '海報品質' },
    { dpi:  75, label: 'acceptable', labelText: '遠距品質' },
  ]
  return levels.map(({ dpi, label, labelText }) => ({
    dpi,
    widthCm:  Math.round((pixelWidth  / dpi / CM_TO_INCH) * 10) / 10,
    heightCm: Math.round((pixelHeight / dpi / CM_TO_INCH) * 10) / 10,
    label,
    labelText,
  }))
}

export async function analyzeImage(file: File): Promise<ImageInfo> {
  let blob: Blob = file

  if (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    file.name.toLowerCase().endsWith('.heic') ||
    file.name.toLowerCase().endsWith('.heif')
  ) {
    const heic2any = (await import('heic2any')).default
    const result   = await heic2any({ blob: file, toType: 'image/jpeg' })
    blob = Array.isArray(result) ? result[0] : result
  }

  const url = URL.createObjectURL(blob)
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload  = () => resolve(image)
    image.onerror = reject
    image.src     = url
  })
  URL.revokeObjectURL(url)

  const width  = img.naturalWidth
  const height = img.naturalHeight
  if (width === 0 || height === 0) throw new Error('無法讀取圖片尺寸')

  const maxPrintSizes = calcPrintSizes(width, height)
  const quality       = getQuality(maxPrintSizes)

  return {
    width,
    height,
    fileSize:      file.size,
    fileName:      file.name,
    fileType:      file.type || 'image/heic',
    quality,
    qualityLabel:  QUALITY_LABELS[quality],
    maxPrintSizes,
    dpiLevels:     calcDpiLevels(width, height),
    aspectRatio:   niceRatio(width, height),
  }
}
