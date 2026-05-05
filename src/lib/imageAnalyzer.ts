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
  canPrint: boolean  // dpi >= 72（與 DPI 表格「可接受品質」一致）
}

export interface DpiLevel {
  dpi: number
  widthCm: number
  heightCm: number
  label: string
  labelText: string
}

// 台灣常見印刷品尺寸（由小到大）
const PRINT_SIZES: { name: string; desc: string; w: number; h: number }[] = [
  { name: '名片',     desc: '標準名片',         w:  9,    h:  5.4  },
  { name: 'DM 卡片',  desc: '促銷卡・小型 DM',  w: 10,    h: 15    },
  { name: 'A6 明信片',desc: '明信片・小傳單',   w: 10.5,  h: 14.8  },
  { name: 'A5 傳單',  desc: '對折傳單・小海報', w: 14.8,  h: 21    },
  { name: 'A4 傳單',  desc: '最常見傳單尺寸',   w: 21,    h: 29.7  },
  { name: 'A3 海報',  desc: '店面張貼・宣傳海報',w: 29.7, h: 42    },
  { name: 'A2 海報',  desc: '展覽海報・活動宣傳',w: 42,   h: 59.4  },
  { name: 'A1 海報',  desc: '大型活動・展場廣告',w: 59.4, h: 84.1  },
  { name: '易拉展',   desc: 'X 架・展場立牌',   w: 80,    h: 200   },
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
 * 根據「≥150 DPI 能達到的最大印刷尺寸」決定整體評級，
 * 避免「整體不足但名片品質優秀」的矛盾顯示。
 */
function getQuality(printSizes: PrintSize[]): ImageInfo['quality'] {
  // ≥150 DPI 才算「高品質」
  const goodSizes = printSizes.filter((s) => s.dpi >= 150)
  if (goodSizes.length === 0) return 'poor'

  const largest = goodSizes[goodSizes.length - 1] // 陣列已從小排到大

  const bigFormats    = ['A3 海報', 'A2 海報', 'A1 海報', '易拉展']
  const mediumFormats = ['A4 傳單']
  const smallFormats  = ['A5 傳單', 'A6 明信片', 'DM 卡片']

  if (bigFormats.includes(largest.name))    return 'excellent'
  if (mediumFormats.includes(largest.name)) return 'good'
  if (smallFormats.includes(largest.name))  return 'fair'
  return 'low' // 只有名片等級
}

const QUALITY_LABELS: Record<ImageInfo['quality'], string> = {
  excellent: '優秀 — 可印大型海報',
  good:      '良好 — 可印 A4 傳單',
  fair:      '尚可 — 適合 A5 以下',
  low:       '偏低 — 適合名片・小型印品',
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
      canPrint: dpi >= 72,   // 與 DPI 表格「可接受品質」門檻統一
    }
  })
}

function calcDpiLevels(pixelWidth: number, pixelHeight: number): DpiLevel[] {
  const CM_TO_INCH = 0.3937
  const levels = [
    { dpi: 300, label: 'extreme',    labelText: '極致品質' },
    { dpi: 150, label: 'excellent',  labelText: '優秀品質' },
    { dpi: 100, label: 'good',       labelText: '良好品質' },
    { dpi:  72, label: 'acceptable', labelText: '可接受品質' },
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
