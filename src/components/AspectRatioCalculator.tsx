'use client'

import { useState } from 'react'

interface Props {
  /** 上傳圖片後由父層傳入，省去用戶手動輸入像素 */
  pixelWidth?: number
  pixelHeight?: number
}

type QualityKey = 'excellent' | 'good' | 'fair' | 'acceptable' | 'poor'

const QUALITY_MAP: Record<QualityKey, {
  label: string; hint: string
  bg: string; border: string; dpiColor: string; badgeBg: string; badgeText: string
}> = {
  excellent:  { label: '極致品質',  hint: '非常清晰，適合精緻印刷',       bg: 'bg-green-50',  border: 'border-green-200', dpiColor: 'text-green-700', badgeBg: 'bg-green-100',  badgeText: 'text-green-700'  },
  good:       { label: '優秀品質',  hint: '畫面清晰，可放心印製',         bg: 'bg-blue-50',   border: 'border-blue-200',  dpiColor: 'text-blue-700',  badgeBg: 'bg-blue-100',   badgeText: 'text-blue-700'   },
  fair:       { label: '良好品質',  hint: '可以印製，近看略有顆粒感',     bg: 'bg-amber-50',  border: 'border-amber-200', dpiColor: 'text-amber-700', badgeBg: 'bg-amber-100',  badgeText: 'text-amber-700'  },
  acceptable: { label: '勉強可用',  hint: '印出後遠看尚可，近看略模糊',   bg: 'bg-orange-50', border: 'border-orange-200',dpiColor: 'text-orange-600',badgeBg: 'bg-orange-100', badgeText: 'text-orange-700' },
  poor:       { label: '解析度不足',hint: '印出後明顯模糊，不建議使用',   bg: 'bg-red-50',    border: 'border-red-200',   dpiColor: 'text-red-600',   badgeBg: 'bg-red-100',    badgeText: 'text-red-600'    },
}

function dpiToKey(dpi: number): QualityKey {
  if (dpi >= 300) return 'excellent'
  if (dpi >= 150) return 'good'
  if (dpi >= 100) return 'fair'
  if (dpi >= 72)  return 'acceptable'
  return 'poor'
}

function calcDpi(pw: number, ph: number, tw: number, th: number): number {
  const CM_TO_INCH = 0.3937
  const longPx  = Math.max(pw, ph)
  const shortPx = Math.min(pw, ph)
  const longCm  = Math.max(tw, th)
  const shortCm = Math.min(tw, th)
  return Math.min(
    Math.round(longPx  / (longCm  * CM_TO_INCH)),
    Math.round(shortPx / (shortCm * CM_TO_INCH))
  )
}

export default function AspectRatioCalculator({ pixelWidth, pixelHeight }: Props) {
  const [manualW, setManualW] = useState('')
  const [manualH, setManualH] = useState('')
  const [targetW, setTargetW] = useState('')
  const [targetH, setTargetH] = useState('')

  // 實際使用的像素值（優先用父層傳入）
  const pw = pixelWidth  ?? parseFloat(manualW)
  const ph = pixelHeight ?? parseFloat(manualH)
  const tw = parseFloat(targetW)
  const th = parseFloat(targetH)

  const hasPixel  = pw > 0 && ph > 0 && !isNaN(pw) && !isNaN(ph)
  const hasTarget = (tw > 0 || th > 0) && !isNaN(tw || 0) && !isNaN(th || 0)
  const canCalc   = hasPixel && hasTarget && tw > 0 && th > 0

  const result = canCalc ? (() => {
    const dpi = calcDpi(pw, ph, tw, th)
    const key  = dpiToKey(dpi)
    return { dpi, ...QUALITY_MAP[key] }
  })() : null

  // 輸入寬 → 依比例算高
  const handleTargetW = (val: string) => {
    setTargetW(val)
    if (hasPixel && val) {
      const r = (parseFloat(val) * ph) / pw
      setTargetH(isNaN(r) ? '' : r.toFixed(1))
    } else if (!val) setTargetH('')
  }

  // 輸入高 → 依比例算寬
  const handleTargetH = (val: string) => {
    setTargetH(val)
    if (hasPixel && val) {
      const r = (parseFloat(val) * pw) / ph
      setTargetW(isNaN(r) ? '' : r.toFixed(1))
    } else if (!val) setTargetW('')
  }

  const reset = () => { setManualW(''); setManualH(''); setTargetW(''); setTargetH('') }

  const inputBase = 'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-transparent transition'

  return (
    <div className="bg-white rounded-3xl apple-shadow p-5 space-y-5">

      {/* 標題 */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-0.5">自訂尺寸品質檢查</p>
        <p className="text-xs text-gray-500 leading-relaxed">
          想印成特定尺寸？輸入你要的寬高（公分），立即告訴你印出來的畫質夠不夠
        </p>
      </div>

      {/* ── 像素資訊區 ── */}
      {pixelWidth && pixelHeight ? (
        /* 已上傳圖片，顯示自動帶入的資訊 */
        <div className="flex items-center gap-2 px-3.5 py-2.5 bg-cyan-50 rounded-xl border border-cyan-100">
          <svg className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-xs text-cyan-700 font-medium">
            已連結上傳的圖片：{pixelWidth.toLocaleString()} × {pixelHeight.toLocaleString()} px
          </span>
        </div>
      ) : (
        /* 尚未上傳，讓用戶手動輸入像素 */
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">圖片原始像素尺寸</label>
          <p className="text-xs text-gray-400 mb-2">上傳圖片後會自動帶入；或手動輸入你知道的像素數字</p>
          <div className="flex gap-2 items-center">
            <input type="number" placeholder="寬（px）" value={manualW}
              onChange={(e) => setManualW(e.target.value)} className={inputBase} />
            <span className="text-gray-300 font-semibold flex-shrink-0 select-none">×</span>
            <input type="number" placeholder="高（px）" value={manualH}
              onChange={(e) => setManualH(e.target.value)} className={inputBase} />
          </div>
        </div>
      )}

      {/* ── 目標印刷尺寸 ── */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">我想印成（公分）</label>
        <p className="text-xs text-gray-400 mb-2">輸入其中一邊，另一邊自動依圖片比例計算</p>
        <div className="flex gap-2 items-center">
          <input type="number" placeholder="寬（cm）" value={targetW}
            onChange={(e) => handleTargetW(e.target.value)}
            className={`${inputBase} border-cyan-200 bg-cyan-50/40 focus:bg-white`} />
          <span className="text-gray-300 font-semibold flex-shrink-0 select-none">×</span>
          <input type="number" placeholder="高（cm）" value={targetH}
            onChange={(e) => handleTargetH(e.target.value)}
            className={`${inputBase} border-cyan-200 bg-cyan-50/40 focus:bg-white`} />
        </div>
      </div>

      {/* ── 結果 ── */}
      {result && (
        <div className={`rounded-2xl px-4 py-4 border ${result.bg} ${result.border} space-y-1 animate-fade-in-up`}>
          <div className="flex items-center justify-between">
            <span className={`text-2xl font-black ${result.dpiColor}`}>{result.dpi} DPI</span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${result.badgeBg} ${result.badgeText}`}>
              {result.label}
            </span>
          </div>
          <p className={`text-xs ${result.dpiColor} opacity-80`}>{result.hint}</p>
          <p className="text-[11px] text-gray-400 pt-0.5">
            印刷尺寸：{targetW} × {targetH} cm　·　圖片：{pw.toLocaleString()} × {ph.toLocaleString()} px
          </p>
        </div>
      )}

      {/* 尚未填入足夠資訊時的提示 */}
      {!result && hasPixel && hasTarget && (
        <p className="text-xs text-gray-400 text-center py-1">請同時輸入寬與高以取得結果</p>
      )}

      <button onClick={reset}
        className="text-xs text-gray-500 hover:text-gray-700 transition-colors underline">
        清除
      </button>
    </div>
  )
}
