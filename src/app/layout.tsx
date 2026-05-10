import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { GoogleAnalytics } from '@next/third-parties/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-jakarta',
})

const SITE_URL = 'https://printsizer.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  title: {
    default: '印刷解析度檢查 | PrintSizer — 你的圖片，能印多大？',
    template: '%s | PrintSizer',
  },
  description: '上傳圖片，立即分析解析度與最佳印刷尺寸。支援 HEIC、JPG、PNG、WebP，完全在裝置上運行，圖片不上傳伺服器。',
  keywords: [
    '印刷解析度', '圖片 DPI', 'DPI 計算', '印刷尺寸', '解析度檢查',
    'HEIC 轉換', '名片解析度', '海報解析度', 'A4 印刷', '傳單印刷',
    'PrintSizer', '印刷品質', '圖片檢查工具', '免費印刷工具',
  ],
  authors: [{ name: 'Owen Studio', url: 'https://owenstudio.netlify.app' }],
  creator: 'Owen Studio',
  publisher: 'Owen Studio',
  verification: {
    google: 'FZIa2sMfzXnYR-Ao91goEB5026Q7kmRXPiBKJWMkyb0',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: '你的圖片，能印多大？| PrintSizer',
    description: '上傳圖片，立即知道能印名片、傳單、海報還是易拉展。免費、免安裝、不上傳。支援 HEIC / JPG / PNG / WebP。',
    url: SITE_URL,
    siteName: 'PrintSizer',
    images: [
      {
        url: '/og-image.png',
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
    description: '上傳圖片，立即分析解析度與最佳印刷尺寸。免費、不上傳。',
    images: ['/og-image.png'],
  },
}

// JSON-LD structured data (WebApplication)
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'PrintSizer',
  url: SITE_URL,
  description: '上傳圖片，立即分析解析度與最佳印刷尺寸。完全在裝置上運行，圖片不上傳伺服器。',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'TWD',
  },
  inLanguage: 'zh-TW',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID ?? 'G-MNFRXZMMMJ'
  return (
    <html lang="zh-TW" className={jakarta.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${jakarta.className} bg-[#f5f5f7] min-h-screen`}>
        {children}
        <Analytics />
        <SpeedInsights />
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  )
}
