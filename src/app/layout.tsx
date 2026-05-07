import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-jakarta',
})

export const metadata: Metadata = {
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  title: '印刷解析度檢查 | PrintSizer — 你的圖片，能印多大？',
  description: '上傳圖片，立即分析解析度與最佳印刷尺寸。完全在你的裝置上運行，不上傳任何伺服器。',
  openGraph: {
    title: '你的圖片，能印多大？| PrintSizer',
    description: '上傳圖片，立即知道能印名片、傳單、海報還是易拉展。免費、免安裝、不上傳。',
    url: 'https://printsizer.owenstudio.netlify.app',
    siteName: 'PrintSizer',
    images: [
      {
        url: '/og-image.png',   // 需手動截圖 og-image.svg → og-image.png 並放到 public/
        width: 1200,
        height: 630,
        alt: 'PrintSizer — 圖片解析度檢查工具',
      },
    ],
    locale: 'zh_TW',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '你的圖片，能印多大？| PrintSizer',
    description: '上傳圖片，立即分析解析度與最佳印刷尺寸。',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" className={jakarta.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className={`${jakarta.className} bg-[#f5f5f7] min-h-screen`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
