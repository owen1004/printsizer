// 圖片解析度分析核心邏輯
// 全程在瀏覽器端執行，圖片不上傳伺服器（符合 CONSTITUTION.md 第 5 條）

export interface ImageInfo {
  width: number
  height: number
  fileSize: number
  fileName: string
  fileType: string
  quality: 'excellent' | 'good' | 'fair' | 'poor'
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

function getQuality(width: number, height: number): ImageInfo['quality'] {
  const px = Math.max(width, height)
  if (px >= 4000) return 'excellent'
  if (px >= 2000) return 'good'
  if (px >= 1000) return 'fair'
  return 'poor'
}

const QUALITY_LABELS: Record<ImageInfo['quality'], string> = {
  excellent: '優秀 — 可印大型海報',
  good:      '良好 — 可印 A3/A4',
  fair:      '尚可 — 建議 A5 以下',
  poor:      '不足 — 印出後可能模糊',
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

  const quality  = getQuality(width, height)
  const divisor  = gcd(width, height)

  return {
    width,
    height,
    fileSize:      file.size,
    fileName:      file.name,
    fileType:      file.type || 'image/heic',
    quality,
    qualityLabel:  QUALITY_LABELS[quality],
    maxPrintSizes: calcPrintSizes(width, height),
    dpiLevels:     calcDpiLevels(width, height),
    aspectRatio:   { w: width / divisor, h: height / divisor },
  }
}
