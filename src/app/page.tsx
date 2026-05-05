'use client'

import { useState } from 'react'
import ImageUploader from '@/components/ImageUploader'
import ResultPanel from '@/components/ResultPanel'
import AspectRatioCalculator from '@/components/AspectRatioCalculator'
import { analyzeImage, ImageInfo } from '@/lib/imageAnalyzer'

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ImageInfo | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    setIsLoading(true)
    setError(null)
    setResult(null)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    try {
      const info = await analyzeImage(file)
      setResult(info)
    } catch (e) {
      setError('無法分析此圖片，請確認檔案格式是否正確。')
      URL.revokeObjectURL(url)
      setPreviewUrl(null)
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setResult(null)
    setError(null)
  }

  return (
    <main className="min-h-screen bg-[#f5f5f7]">

      {/* ── Header（Apple frosted glass）── */}
      <header className="glass border-b border-gray-200/70 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-5 h-14 flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-400 rounded-lg flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" stroke="white" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.1935 16.793C20.8437 19.2739 20.6689 20.5143 19.7717 21.2572C18.8745 22 17.5512 22 14.9046 22H9.09536C6.44881 22 5.12553 22 4.22834 21.2572C3.33115 20.5143 3.15626 19.2739 2.80648 16.793L2.38351 13.793C1.93748 10.6294 1.71447 9.04765 2.66232 8.02383C3.61017 7 5.29758 7 8.67239 7H15.3276C18.7024 7 20.3898 7 21.3377 8.02383C22.0865 8.83268 22.1045 9.98979 21.8592 12" strokeWidth="1.5"/>
              <path d="M19.5617 7C19.7904 5.69523 18.7863 4.5 17.4617 4.5H6.53788C5.21323 4.5 4.20922 5.69523 4.43784 7" strokeWidth="1.5"/>
              <path d="M17.4999 4.5C17.5283 4.24092 17.5425 4.11135 17.5427 4.00435C17.545 2.98072 16.7739 2.12064 15.7561 2.01142C15.6497 2 15.5194 2 15.2588 2H8.74099C8.48035 2 8.35002 2 8.24362 2.01142C7.22584 2.12064 6.45481 2.98072 6.45704 4.00434C6.45727 4.11135 6.47146 4.2409 6.49983 4.5" strokeWidth="1.5"/>
              <circle cx="16.5" cy="11.5" r="1.5" strokeWidth="1.5"/>
              <path d="M19.9999 20L17.1157 17.8514C16.1856 17.1586 14.8004 17.0896 13.7766 17.6851L13.5098 17.8403C12.7984 18.2542 11.8304 18.1848 11.2156 17.6758L7.37738 14.4989C6.6113 13.8648 5.38245 13.8309 4.5671 14.4214L3.24316 15.3803" strokeWidth="1.5"/>
            </svg>
          </div>
          <span className="font-semibold text-gray-900 text-sm tracking-tight">PrintSizer</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-5">

        {/* ── Hero（只在上傳前顯示）── */}
        {!result && (
          <div className="text-center pt-14 pb-10">
            <p className="text-xs font-semibold tracking-widest text-orange-500 uppercase mb-3">圖片解析度檢查</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight gradient-text">
              你的圖片，能印多大？
            </h1>
            <p className="text-lg text-gray-500 max-w-lg mx-auto leading-relaxed">
              上傳圖片，立即分析解析度與最佳印刷尺寸。<br className="hidden md:block" />
              完全在你的裝置上運行，不上傳任何伺服器。
            </p>
          </div>
        )}

        {/* ── 上傳區 / 結果區 ── */}
        <div className="pb-6">
          {!result ? (
            <>
              <ImageUploader onFileSelected={handleFile} isLoading={isLoading} />
              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl px-5 py-4 text-sm">
                  ⚠️ {error}
                </div>
              )}
              {/* Feature list */}
              <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-2">
                {['支援 iPhone HEIC', 'JPG / PNG / WebP', '完全不上傳', 'RWD 手機優化'].map((f) => (
                  <span key={f} className="text-sm text-gray-600 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="pt-6">
              <ResultPanel info={result} previewUrl={previewUrl} onReset={handleReset} />
            </div>
          )}
        </div>

        {/* ── 自訂尺寸品質檢查（永遠顯示）── */}
        <div className="pb-12">
          <AspectRatioCalculator
            pixelWidth={result?.width}
            pixelHeight={result?.height}
          />
        </div>
      </div>
      {/* ── 浮動 LINE 按鈕（永遠顯示）── */}
      <a
        href="https://lin.ee/V78i92c"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LINE 直接聯絡"
        className="fixed bottom-6 right-5 z-50 flex flex-col items-center gap-1 group"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="w-14 h-14 rounded-full bg-[#06C755] flex items-center justify-center
          shadow-[0_4px_20px_rgba(6,199,85,0.40)]
          group-hover:shadow-[0_6px_28px_rgba(6,199,85,0.55)]
          group-hover:scale-110 active:scale-100
          transition-all duration-200">
          <svg aria-hidden="true" className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
          </svg>
        </div>
        <span className="text-[10px] font-semibold text-gray-500 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm select-none">
          LINE
        </span>
      </a>
    </main>
  )
}
