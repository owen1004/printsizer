'use client'

import { useRef } from 'react'
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
  excellent: { label: '優秀', meterPct: 93, gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' },
  good:      { label: '良好', meterPct: 72, gradient: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)' },
  fair:      { label: '尚可', meterPct: 50, gradient: 'linear-gradient(135deg, #F59E0B 0%, #F97316 100%)' },
  low:       { label: '偏低', meterPct: 28, gradient: 'linear-gradient(135deg, #F97316 0%, #EF4444 100%)' },
  poor:      { label: '不足', meterPct: 8,  gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' },
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
  acceptable: { dot: 'bg-orange-400', label: '可接受', textColor: 'text-orange-700'},
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

function getBestQualitySize(sizes: PrintSize[]): PrintSize | null {
  const extreme = sizes.filter((s) => s.dpi >= 300)
  if (extreme.length) return extreme[extreme.length - 1]
  const good = sizes.filter((s) => s.dpi >= 150)
  if (good.length) return good[good.length - 1]
  const fair = sizes.filter((s) => s.dpi >= 100)
  if (fair.length) return fair[fair.length - 1]
  return null
}

export default function ResultPanel({ info, previewUrl, onReset }: Props) {
  const cfg       = OVERALL_CONFIG[info.quality]
  const printable = info.maxPrintSizes.filter((s) => s.canPrint)
  const bestSize  = printable[printable.length - 1]
  const goodSize  = getBestQualitySize(info.maxPrintSizes)

  const containerRef = useRef<HTMLDivElement>(null)
  const dotRef       = useRef<HTMLDivElement>(null)

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

    // 9. 底部按鈕
    tl.from('.gs-bottom', { y: 12, opacity: 0, duration: 0.35, stagger: 0.08 }, '-=0.1')

  }, { scope: containerRef })

  return (
    <div ref={containerRef} className="space-y-4">

      {/* ── 評分卡 ── */}
      <div className="bg-white rounded-3xl apple-shadow overflow-hidden">

        {/* 全寬預覽圖 */}
        {previewUrl && (
          <div className="gs-hero relative w-full h-52 bg-gray-100">
            <Image
              src={previewUrl} alt="上傳的圖片"
              fill className="object-contain" unoptimized
            />
            {/* 評級徽章 */}
            <div className="gs-badge absolute top-3 right-3 px-3 py-1 rounded-full backdrop-blur-md bg-white/80 shadow-sm">
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
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">解析度評級</p>
              <span className="text-2xl font-black" style={{
                background: cfg.gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>{cfg.label}</span>
            </div>
          )}
          {previewUrl && (
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">解析度評級</p>
          )}
          <p className="text-xl font-bold tracking-tight text-gray-900">{info.qualityLabel}</p>
          <p className="text-xs text-gray-500 mt-1">
            {info.width.toLocaleString()} × {info.height.toLocaleString()} px
            &ensp;·&ensp;{formatFileSize(info.fileSize)}
            &ensp;·&ensp;{info.aspectRatio.w}:{info.aspectRatio.h}
          </p>

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
              <span>不足</span><span>優秀</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 摘要卡（最佳建議 + 最大可印）── */}
      <div className="grid grid-cols-2 gap-3">

        <div className="gs-card bg-white rounded-2xl apple-shadow p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">最佳建議</p>
          {goodSize ? (
            <>
              <p className="text-lg font-bold tracking-tight text-gray-900">{goodSize.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{goodSize.width} × {goodSize.height} cm</p>
              <p className="text-xs text-gray-400 mt-1">{goodSize.desc}</p>
              <span className={`inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full ${PRINT_QUALITY[goodSize.printQuality].textColor} bg-gray-100`}>
                {PRINT_QUALITY[goodSize.printQuality].label} · {goodSize.dpi} DPI
              </span>
            </>
          ) : (
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">圖片解析度不足，建議使用更高畫質的圖片</p>
          )}
        </div>

        <div className="gs-card bg-white rounded-2xl apple-shadow p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">最大可印</p>
          {bestSize ? (
            <>
              <p className="text-lg font-bold tracking-tight text-gray-900">{bestSize.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{bestSize.width} × {bestSize.height} cm</p>
              <p className="text-xs text-gray-400 mt-1">{bestSize.desc}</p>
              <span className={`inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full ${PRINT_QUALITY[bestSize.printQuality].textColor} bg-gray-100`}>
                {PRINT_QUALITY[bestSize.printQuality].label} · {bestSize.dpi} DPI
              </span>
            </>
          ) : (
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">解析度不足，無法印製任何標準尺寸</p>
          )}
        </div>
      </div>

      {/* ── 印刷服務 CTA ── */}
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

      {/* ── DPI 等級對照表 ── */}
      <div className="bg-white rounded-3xl apple-shadow p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">各品質等級最大可印尺寸</p>
        <p className="text-xs text-gray-500 mb-4">保持原始比例，在不同 DPI 品質下的最大輸出尺寸</p>
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

      {/* ── 各印刷尺寸品質一覽 ── */}
      <div className="bg-white rounded-3xl apple-shadow p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1">各印刷尺寸品質</p>
        <p className="text-xs text-gray-500 mb-4">低於 72 DPI 不建議印製（視覺可見鋸齒）</p>
        <div className="space-y-1.5">
          {info.maxPrintSizes.map((size) => {
            const q = PRINT_QUALITY[size.printQuality]
            return (
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
          })}
        </div>
      </div>

      {/* ── 底部 CTA ── */}
      <div className="flex gap-2">
        <a href="https://owenstudio.netlify.app/#plans" target="_blank" rel="noopener noreferrer"
          className="gs-bottom flex-1 py-3 rounded-2xl bg-gray-900 text-white text-sm font-semibold
                     text-center tracking-tight hover:bg-gray-700 active:scale-[0.97]
                     transition-all duration-150">
          查看印刷服務 →
        </a>
        <a href="https://lin.ee/V78i92c" target="_blank" rel="noopener noreferrer"
          className="gs-bottom flex-1 py-3 rounded-2xl border border-[#06C755] text-[#06C755]
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
        className="gs-bottom w-full py-3.5 rounded-2xl bg-white apple-shadow border border-gray-200
                   text-gray-600 font-semibold text-sm tracking-tight
                   hover:border-cyan-300 hover:text-cyan-600
                   active:scale-[0.98] transition-all duration-200"
      >
        ↩ 重新上傳圖片
      </button>
    </div>
  )
}
