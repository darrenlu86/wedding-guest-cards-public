import type { Metadata } from 'next';
import '@/styles/globals.css';

// 部署時請設定 NEXT_PUBLIC_SITE_URL 環境變數（e.g. https://wedding.example.tw）。
// metadata 在 build time 解析，所以 fallback 必須是合法 URL，
// 否則 Next.js metadataBase 會 throw。
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://your-domain.example.com';
const SITE_TITLE = 'Alex & Jamie — 婚禮感謝小卡';
const SITE_DESCRIPTION = '謝謝你見證這一天，這張卡片送給你。每位賓客都有一張專屬的感謝小卡，掃描 QR Code 即可開啟。';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: '%s | Alex & Jamie 婚禮',
  },
  description: SITE_DESCRIPTION,
  keywords: ['婚禮', '感謝卡', '祝福卡片', 'Alex', 'Jamie', 'wedding card'],
  authors: [{ name: 'Alex & Jamie' }],
  openGraph: {
    type: 'website',
    locale: 'zh_TW',
    url: SITE_URL,
    siteName: SITE_TITLE,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/sample-cover.svg',
        width: 1200,
        height: 800,
        alt: 'Alex & Jamie 婚禮感謝小卡',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ['/sample-cover.svg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}
