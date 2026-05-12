import type { Metadata } from 'next';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ guestId: string }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { guestId } = await params;

  return {
    title: '你的專屬感謝小卡',
    description: 'Alex & Jamie為你準備了一張專屬感謝小卡，點擊開啟。',
    openGraph: {
      title: 'Alex & Jamie — 你的專屬感謝小卡',
      description: '謝謝你見證這一天，打開看看我們為你準備的卡片吧！',
      url: `/card/${guestId}`,
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
      title: 'Alex & Jamie — 你的專屬感謝小卡',
      description: '謝謝你見證這一天，打開看看我們為你準備的卡片吧！',
      images: ['/sample-cover.svg'],
    },
  };
}

export default function CardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
