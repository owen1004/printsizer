'use client'

import { useCallback, useState } from 'react'

interface Props {
  onFileSelected: (file: File) => void
  isLoading: boolean
}

const ACCEPTED_TYPES      = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/gif', 'image/bmp']
const ACCEPTED_EXTENSIONS = '.jpg,.jpeg,.png,.webp,.heic,.heif,.gif,.bmp'

export default function ImageUploader({ onFileSelected, isLoading }: Props) {
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = useCallback(
    (file: File) => {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
      const validExt = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'gif', 'bmp'].includes(ext)
      if (!ACCEPTED_TYPES.includes(file.type) && !validExt) {
        alert('不支援此格式，請上傳 JPG、PNG、WebP、HEIC 等圖片檔案')
        return
      }
      onFileSelected(file)
    },
    [onFileSelected]
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
      e.target.value = ''
    },
    [handleFile]
  )

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      aria-label="圖片上傳區域"
      className={`
        relative bg-white rounded-3xl text-center cursor-pointer
        border-2 border-dashed transition-all duration-300 apple-shadow
        ${isDragging
          ? 'border-cyan-400 drop-glow-cool scale-[1.005]'
          : 'border-gray-200 hover:border-cyan-300 hover:apple-shadow-md'
        }
        ${isLoading ? 'opacity-60 pointer-events-none' : ''}
      `}
    >
      <input
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        onChange={onInputChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isLoading}
        aria-hidden="true"
      />

      <div className="py-14 px-8 flex flex-col items-center gap-6">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-cyan-50 flex items-center justify-center">
              <div className="w-8 h-8 border-[3px] border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <div>
              <p className="font-semibold text-gray-700">分析中...</p>
              <p className="text-sm text-gray-600 mt-0.5">正在計算解析度與可印尺寸</p>
            </div>
          </div>
        ) : (
          <>
            {/* 上傳圖示 */}
            <div className={`
              w-20 h-20 rounded-full flex items-center justify-center
              bg-cyan-50 animate-pulse-cool transition-transform duration-200
              ${isDragging ? 'scale-110 bg-cyan-100' : ''}
            `}>
              <svg aria-hidden="true" className="w-9 h-9 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>

            {/* 文字 */}
            <div className="space-y-1 -mt-2">
              <p className="text-xl font-semibold tracking-tight text-gray-900">
                {isDragging ? '放開以分析圖片' : '點擊或拖放圖片'}
              </p>
              <p className="text-sm text-gray-600 hidden md:block">支援從電腦拖放，或直接點擊選取</p>
              <p className="text-sm text-cyan-500 md:hidden font-medium">手機可直接拍照上傳</p>
            </div>

            {/* 格式標籤 */}
            <div className="flex flex-wrap justify-center gap-1.5">
              {['JPG', 'PNG', 'WebP', 'HEIC', 'GIF', 'BMP'].map((fmt) => (
                <span key={fmt}
                  className="px-2.5 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                  {fmt}
                </span>
              ))}
            </div>

            {/* 隱私聲明 */}
            <p className="flex items-center gap-1.5 text-xs text-gray-600">
              <svg aria-hidden="true" className="w-3.5 h-3.5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              圖片只在你的裝置上分析，不上傳到任何伺服器
            </p>
          </>
        )}
      </div>
    </div>
  )
}
