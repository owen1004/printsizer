'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ImageInfo, PrintSize } from '@/lib/imageAnalyzer'

gsap.registerPlugin(useGSAP)

interface Props {
  info: ImageInfo
  previewUrl: string | null
  onReset: () => void
}

const OVERALL_CONFIG: Record<ImageInfo['quality'], {
  label: string; meterPct: number; gradient: string
}> = {
  excellent: { label: '頂級',   meterPct: 93, gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' },
  good:      { label: '高品質', meterPct: 72, gradient: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)' },
  fair:      { label: '中等',   meterPct: 50, gradient: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)' },
  low:       { label: '偏低',   meterPct: 28, gradient: 'linear-gradient(135deg, #F97316 0%, #EF4444 100%)' },
  poor:      { label: '不足',   meterPct: 8,  gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' },
}

const METER_DOT: Record<ImageInfo['quality'], string> = {
  excellent: 'border-green-500',
  good:      'border-blue-500',
  fair:      'border-amber-500',
  low:       'border-orange-500',
  poor:      'border-red-500',
}

const PRINT_QUALITY: Record<PrintSize['printQuality'], {
  dot: string; label: string; textColor: string
}> = {
  excellent:  { dot: 'bg-green-500',  label: '極致',   textColor: 'text-green-700' },
  good:       { dot: 'bg-blue-500',   label: '優秀',   textColor: 'text-blue-700'  },
  fair:       { dot: 'bg-amber-500',  label: '良好',   textColor: 'text-amber-700' },
  acceptable: { dot: 'bg-orange-400', label: '勉強',   textColor: 'text-orange-700'},
  poor:       { dot: 'bg-gray-300',   label: '不建議', textColor: 'text-gray-500'  },
}

const DPI_ROW: Record<string, { bg: string; text: string; badge: string }> = {
  extreme:    { bg: 'bg-green-50',  text: 'text-green-700',  badge: 'bg-green-100 text-green-700'  },
  excellent:  { bg: 'bg-blue-50',   text: 'text-blue-700',   badge: 'bg-blue-100 text-blue-700'    },
  good:       { bg: 'bg-amber-50',  text: 'text-amber-700',  badge: 'bg-amber-100 text-amber-700'  },
  acceptable: { bg: 'bg-gray-50',   text: 'text-gray-600',   badge: 'bg-gray-100 text-gray-600'    },
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

// 「最佳建議」邏輯：
// 1. 必須通過該尺寸的 minDpi 才算可印
// 2. 從可印中挑「DPI ≥ 1.5×minDpi」的最大尺寸（comfortable headroom）
// 3. 若沒有特別優質的，退回最大可印（與「最大可印」一致即可）
function getBestQualitySize(sizes: PrintSize[]): PrintSize | null {
  const printable = sizes.filter((s) => s.canPrint)
  if (!printable.length) return null
  const premium = printable.filter((s) => s.dpi >= s.minDpi * 1.5)
  if (premium.length) return premium[premium.length - 1]
  return printable[printable.length - 1]
}

// 計算印某尺寸所需的最低像素（用於「不足」狀態的解決方案卡片）
function pxNeeded(cmW: number, cmH: number, dpi: number): { w: number; h: number } {
  const CM_TO_INCH = 0.3937
  return {
    w: Math.round(cmW * CM_TO_INCH * dpi),
    h: Math.round(cmH * CM_TO_INCH * dpi),
  }
}

function formatPx(n: number): string {
  return n.toLocaleString()
}

function formatMP(w: number, h: number): string {
  const mp = (w * h) / 1_000_000
  if (mp < 1) return `${Math.round(mp * 100)} 萬像素`
  return `${mp.toFixed(1)} 百萬像素`
}

export default function ResultPanel({ info, previewUrl, onReset }: Props) {
  const cfg          = OVERALL_CONFIG[info.quality]
  const printable    = info.maxPrintSizes.filter((s) => s.canPrint)
  const noPrintable  = printable.length === 0
  const bestSize     = printable[printable.length - 1]
  const goodSize     = getBestQualitySize(info.maxPrintSizes)
  // 「不足」狀態的目標像素參考值（名片 200 DPI / A4 傳單 150 DPI）
  const cardTarget   = pxNeeded(9, 5.4, 200)        // → ~709 × 425
  const a4Target     = pxNeeded(21, 29.7, 150)      // → 1240 × 1754

  const containerRef = useRef<HTMLDivElement>(null)
  const dotRef       = useRef<HTMLDivElement>(null)
  const [showStandardInfo, setShowStandardInfo] = useState(false)

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

    // 1. Hero 圖片 zoom-in + fade
    tl.from('.gs-hero', { scale: 1.06, opacity: 0, duration: 0.55 })

    // 2. 評級徽章從右滑入
    tl.from('.gs-badge', { x: 18, opacity: 0, duration: 0.35, ease: 'back.out(2)' }, '-=0.25')

    // 3. 資訊區往上淡入
    tl.from('.gs-info', { y: 14, opacity: 0, duration: 0.4 }, '-=0.2')

    // 4. 計量條指針彈跳到位（elastic）
    if (dotRef.current) {
      gsap.fromTo(
        dotRef.current,
        { left: '0%' },
        { left: `${cfg.meterPct}%`, duration: 1.0, delay: 0.35, ease: 'elastic.out(1, 0.55)' }
      )
    }

    // 5. 摘要卡片左右錯開入場
    tl.from('.gs-card', { y: 22, opacity: 0, duration: 0.4, stagger: 0.1 }, '-=0.1')

    // 6. CTA 卡
    tl.from('.gs-cta', { y: 16, opacity: 0, duration: 0.4 }, '-=0.15')

    // 7. DPI 等級列錯開
    tl.from('.gs-dpi-row', { x: -14, opacity: 0, duration: 0.3, stagger: 0.06 }, '-=0.2')

    // 8. 各印刷品列錯開
    tl.from('.gs-size-row', { x: -10, opacity: 0, duration: 0.25, stagger: 0.04 }, '-=0.15')

  }, { scope: containerRef })

  return (
    <div ref={containerRef} className="space-y-4">

      {/* ── 評分卡 ── */}
      <div className="bg-white rounded-3xl apple-shadow overflow-hidden">

        {/* 全寬預覽圖（小圖也能填滿，靠模糊放大版當底） */}
        {previewUrl && (
          <div className="gs-hero relative w-full h-64 sm:h-72 bg-gray-900 overflow-hidden">
            {/* 模糊放大版作為底層，避免左右大量空白 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-60 select-none"
            />
            {/* 主圖：等比縮放，置中 */}
            <Image
              src={previewUrl} alt="上傳的圖片"
              fill className="object-contain relative drop-shadow-xl" unoptimized
            />
            {/* 評級徽章 */}
            <div className="gs-badge absolute top-3 right-3 px-3 py-1 rounded-full backdrop-blur-md bg-white/80 shadow-sm z-10">
              <span
                className="text-base font-black"
                style={{
                  background: cfg.gradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {cfg.label}
              </span>
            </div>
          </div>
        )}

        {/* 資訊區 */}
        <div className="gs-info px-5 pt-4 pb-5">
          {!previewUrl && (
            <div className="flex justify-between items-start mb-1">
              <button
                type="button"
                onClick={() => setShowStandardInfo((v) => !v)}
                className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-widest hover:text-gray-700 transition-colors"
                aria-expanded={showStandardInfo}
              >
                解析度評級
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4M12 8h.01" />
                </svg>
              </button>
              <span className="text-2xl font-black" style={{
                background: cfg.gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>{cfg.label}</span>
            </div>
          )}
          {previewUrl && (
            <button
              type="button"
              onClick={() => setShowStandardInfo((v) => !v)}
              className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1 hover:text-gray-700 transition-colors"
              aria-expanded={showStandardInfo}
            >
              解析度評級
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4M12 8h.01" />
              </svg>
            </button>
          )}
          <p className="text-xl font-bold tracking-tight text-gray-900">{info.qualityLabel}</p>
          <p className="text-xs text-gray-500 mt-1">
            {info.width.toLocaleString()} × {info.height.toLocaleString()} px
            &ensp;·&ensp;{formatFileSize(info.fileSize)}
            &ensp;·&ensp;{info.aspectRatio.w}:{info.aspectRatio.h}
          </p>

          {/* 評級標準說明（可展開） */}
          {showStandardInfo && (
            <div className="mt-3 bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xs leading-relaxed text-gray-600">
              <p className="font-semibold text-gray-800 mb-1.5">為什麼有些網站給出不一樣的結果？</p>
              <p className="mb-2">
                PrintSizer 按「<strong className="text-gray-800">實際觀看距離</strong>」判斷品質，
                因為印刷品的清晰度需求隨用途而變：
              </p>
              <ul className="space-y-1 mb-2">
                <li>· 名片拿手上 30cm 看，需 <strong>200 DPI</strong> 才不糊字</li>
                <li>· A4 傳單閱讀距離 50cm，<strong>150 DPI</strong> 達標</li>
                <li>· A3 海報店面 1m 距離，<strong>120 DPI</strong> 即可</li>
                <li>· 易拉展 3m 外遠看，<strong>50 DPI</strong> 也無妨</li>
              </ul>
              <p>
                其他工具多用單一門檻（如 75 或 150 DPI 一刀切），
                會把可印的大圖誤判為不行，或把不該印的小圖誤判為可以。
              </p>
            </div>
          )}

          {/* 品質計量條 */}
          <div className="mt-3">
            <div className="relative h-1.5 rounded-full overflow-visible bg-gradient-to-r from-red-400 via-amber-400 to-green-400">
              <div
                ref={dotRef}
                className={`absolute w-3 h-3 rounded-full bg-white border-2 shadow-sm ${METER_DOT[info.quality]}`}
                style={{ top: '50%', transform: 'translateY(-50%) translateX(-50%)', left: '0%' }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-500 mt-1 select-none">
              <span>不足</span><span>頂級</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 摘要卡（最佳建議 + 最大可印）／ 不足時改為單一診斷卡 ── */}
      {noPrintable ? (
        <div className="gs-card bg-orange-50 border border-orange-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-gray-900 mb-0.5">這張圖無法印出標準尺寸</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                名片、傳單、海報的最低印刷門檻都未達到。<br />
                請參考下方解決方案找到更合適的圖片。
              </p>
            </div>
          </div>
        </div>
      ) : goodSize && bestSize && goodSize.name !== bestSize.name ? (
        // best ≠ max：兩張卡片並排，提供不同維度的建議
        <div className="grid grid-cols-2 gap-3">
          <div className="gs-card bg-white rounded-2xl apple-shadow p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">最佳建議</p>
            <p className="text-lg font-bold tracking-tight text-gray-900">{goodSize.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{goodSize.width} × {goodSize.height} cm</p>
            <p className="text-xs text-gray-400 mt-1">{goodSize.desc}</p>
            <span className={`inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full ${PRINT_QUALITY[goodSize.printQuality].textColor} bg-gray-100`}>
              {PRINT_QUALITY[goodSize.printQuality].label} · {goodSize.dpi} DPI
            </span>
          </div>

          <div className="gs-card bg-white rounded-2xl apple-shadow p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">最大可印</p>
            <p className="text-lg font-bold tracking-tight text-gray-900">{bestSize.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{bestSize.width} × {bestSize.height} cm</p>
            <p className="text-xs text-gray-400 mt-1">{bestSize.desc}</p>
            <span className={`inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full ${PRINT_QUALITY[bestSize.printQuality].textColor} bg-gray-100`}>
              {PRINT_QUALITY[bestSize.printQuality].label} · {bestSize.dpi} DPI
            </span>
          </div>
        </div>
      ) : bestSize ? (
        // best == max（單一最佳建議）：合併成一張全寬卡片，避免訊息冗餘
        <div className="gs-card bg-white rounded-2xl apple-shadow p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">建議印製尺寸</p>
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-lg font-bold tracking-tight text-gray-900">{bestSize.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{bestSize.width} × {bestSize.height} cm　·　{bestSize.desc}</p>
            </div>
            <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${PRINT_QUALITY[bestSize.printQuality].textColor} bg-gray-100 flex-shrink-0`}>
              {PRINT_QUALITY[bestSize.printQuality].label} · {bestSize.dpi} DPI
            </span>
          </div>
        </div>
      ) : null}

      {/* ── 印刷服務 CTA ／ 不足時改為解決方案卡片 ── */}
      {noPrintable ? (
        <div className="gs-cta bg-white rounded-3xl apple-shadow overflow-hidden">
          <div className="h-[3px] bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400" />
          <div className="p-5">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                <svg aria-hidden="true" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm leading-snug">解析度不足，這樣解決</p>
                <p className="text-xs text-gray-500 mt-0.5">用更大的圖才能印出清晰成品</p>
              </div>
            </div>

            {/* 像素對照 */}
            <div className="bg-gray-50 rounded-2xl p-3.5 mb-4">
              <p className="text-xs text-gray-500 mb-2">你的圖 vs 印刷需求</p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">目前圖片</span>
                  <span className="font-semibold text-orange-600">
                    {formatPx(info.width)} × {formatPx(info.height)} px
                    <span className="text-gray-400 font-normal ml-1">（{formatMP(info.width, info.height)}）</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">印名片至少需要</span>
                  <span className="font-semibold text-gray-700">
                    {formatPx(cardTarget.w)} × {formatPx(cardTarget.h)} px
                    <span className="text-gray-400 font-normal ml-1">（{formatMP(cardTarget.w, cardTarget.h)}）</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">印 A4 傳單至少需要</span>
                  <span className="font-semibold text-gray-700">
                    {formatPx(a4Target.w)} × {formatPx(a4Target.h)} px
                    <span className="text-gray-400 font-normal ml-1">（{formatMP(a4Target.w, a4Target.h)}）</span>
                  </span>
                </div>
              </div>
            </div>

            {/* 三條解決路徑 */}
            <ol className="space-y-2.5 mb-4 text-sm">
              <li className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                <div>
                  <p className="font-semibold text-gray-900">找原始檔</p>
                  <p className="text-xs text-gray-500 mt-0.5">從手機/相機原圖匯出，避免從 LINE/IG/FB 下載（會被壓縮）</p>
                </div>
              </li>
              <li className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                <div>
                  <p className="font-semibold text-gray-900">重新拍攝或掃描</p>
                  <p className="text-xs text-gray-500 mt-0.5">拍照設最高解析度；掃描設 300 DPI 以上</p>
                </div>
              </li>
              <li className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                <div>
                  <p className="font-semibold text-gray-900">AI 放大工具（細節有極限）</p>
                  <p className="text-xs text-gray-500 mt-0.5">坊間有免費軟體可試做初步處理。複雜或商業用途，建議交給專業印刷廠處理。</p>
                </div>
              </li>
            </ol>

            <a href="https://lin.ee/V78i92c" target="_blank" rel="noopener noreferrer"
              className="block py-2.5 rounded-xl border border-[#06C755] text-[#06C755] text-sm font-semibold
                         text-center tracking-tight hover:bg-green-50 active:scale-[0.97] transition-all duration-150
                         flex items-center justify-center gap-1.5">
              <svg aria-hidden="true" className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
              </svg>
              LINE 諮詢解決方案
            </a>
          </div>
        </div>
      ) : (
        <div className="gs-cta bg-white rounded-3xl apple-shadow overflow-hidden">
          <div className="h-[3px] bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400" />
          <div className="p-5">
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                <svg aria-hidden="true" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.056 48.056 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm leading-snug">確認好尺寸了？讓我幫你印出來</p>
                <p className="text-xs text-gray-500 mt-0.5">專業印刷服務，從設計到成品一手包辦</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a href="https://owenstudio.netlify.app/#plans" target="_blank" rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold text-center tracking-tight
                           hover:bg-gray-700 active:scale-[0.97] transition-all duration-150">
                查看服務方案 →
              </a>
              <a href="https://lin.ee/V78i92c" target="_blank" rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl border border-[#06C755] text-[#06C755] text-sm font-semibold
                           text-center tracking-tight hover:bg-green-50 active:scale-[0.97] transition-all duration-150
                           flex items-center justify-center gap-1.5">
                <svg aria-hidden="true" className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                </svg>
                LINE 直接詢價
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── DPI 等級對照表（不足狀態下隱藏，避免跟主評級訊號矛盾）── */}
      {!noPrintable && (
        <div className="bg-white rounded-3xl apple-shadow p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">各品質等級最大可印尺寸</p>
          <p className="text-xs text-gray-500 mb-4">保持原始比例，DPI 越低 → 可印越大但需越遠距離觀看</p>
          <div className="space-y-2">
            {info.dpiLevels.map((lvl) => {
              const s = DPI_ROW[lvl.label]
              return (
                <div key={lvl.dpi} className={`gs-dpi-row flex items-center rounded-xl px-4 py-3 ${s.bg}`}>
                  <div className="w-14 flex-shrink-0">
                    <span className={`text-xl font-black ${s.text}`}>{lvl.dpi}</span>
                    <span className={`text-xs ml-1 ${s.text} opacity-60`}>DPI</span>
                  </div>
                  <div className="flex-1 text-center">
                    <span className={`text-sm font-semibold ${s.text}`}>
                      {lvl.widthCm} × {lvl.heightCm} cm
                    </span>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.badge}`}>
                    {lvl.labelText}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── 各印刷尺寸品質一覽 ── */}
      <div className="bg-white rounded-3xl apple-shadow p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">各印刷尺寸品質</p>
        <p className="text-xs text-gray-500 mb-4">門檻按觀看距離分層（名片需 200 DPI、A4 需 150 DPI、易拉展遠看僅需 50 DPI）</p>
        <div className="space-y-1.5">
          {[...info.maxPrintSizes]
            .sort((a, b) => (b.canPrint ? 1 : 0) - (a.canPrint ? 1 : 0) || b.dpi - a.dpi)
            .flatMap((size, idx, arr) => {
            // 全圖無可印時，把「可接受」緩衝層也壓成「不建議」
            const effectiveQuality =
              noPrintable && size.printQuality === 'acceptable' ? 'poor' : size.printQuality
            const q = PRINT_QUALITY[effectiveQuality]
            const prev = idx > 0 ? arr[idx - 1] : null
            const showSeparator = !noPrintable && prev?.canPrint === true && !size.canPrint

            const row = (
              <div
                key={size.name}
                className={`gs-size-row flex items-center gap-3 rounded-xl px-4 py-3 transition-colors
                  ${size.canPrint ? 'bg-gray-50 hover:bg-gray-100/80' : 'opacity-40'}`}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${q.dot}`} />
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-gray-800 text-sm block">{size.name}</span>
                  <span className="text-[11px] text-gray-400 block">{size.desc}　{size.width} × {size.height} cm</span>
                </div>
                <span className="text-xs font-semibold text-gray-400 flex-shrink-0">{size.dpi} DPI</span>
                <span className={`text-xs font-semibold w-14 text-right flex-shrink-0 ${q.textColor}`}>{q.label}</span>
              </div>
            )

            if (!showSeparator) return [row]

            const separator = (
              <div key="threshold-separator" className="relative flex items-center my-1">
                <div className="flex-grow border-t border-dashed border-gray-300" />
                <span className="flex-shrink-0 mx-3 text-[11px] font-semibold px-3 py-0.5 rounded-full bg-orange-50 text-orange-500 border border-orange-200 whitespace-nowrap">
                  ⚠ 以下低於各尺寸最低印刷門檻
                </span>
                <div className="flex-grow border-t border-dashed border-gray-300" />
              </div>
            )

            return [separator, row]
          })}
        </div>
      </div>

      {/* ── 底部 CTA ── */}
      <div className="flex gap-2 animate-fade-in-up animate-delay-300">
        <a href="https://owenstudio.netlify.app/#plans" target="_blank" rel="noopener noreferrer"
          className="flex-1 py-3 rounded-2xl bg-gray-900 text-white text-sm font-semibold
                     text-center tracking-tight hover:bg-gray-700 active:scale-[0.97]
                     transition-all duration-150">
          查看印刷服務 →
        </a>
        <a href="https://lin.ee/V78i92c" target="_blank" rel="noopener noreferrer"
          className="flex-1 py-3 rounded-2xl border border-[#06C755] text-[#06C755]
                     text-sm font-semibold text-center tracking-tight
                     hover:bg-green-50 active:scale-[0.97] transition-all duration-150
                     flex items-center justify-center gap-1.5">
          <svg aria-hidden="true" className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
          </svg>
          LINE 詢價
        </a>
      </div>

      {/* ── 重新上傳 ── */}
      <button
        onClick={onReset}
        className="animate-fade-in-up animate-delay-300 w-full py-3.5 rounded-2xl bg-white apple-shadow border border-gray-200
                   text-gray-600 font-semibold text-sm tracking-tight
                   hover:border-cyan-300 hover:text-cyan-600
                   active:scale-[0.98] transition-all duration-200"
      >
        ↩ 重新上傳圖片
      </button>
    </div>
  )
}
