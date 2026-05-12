import { Guest } from '@/types/guest';
import BorderOrnament from './BorderOrnament';
import DividerElegant from './DividerElegant';
import CornerOrnament from './CornerOrnament';
import { getCardTheme } from './cardTemplates';

const DEFAULT_IMAGE = '/sample-cover.svg';

interface BlessingCardProps {
  guest: Guest;
}

export default function BlessingCard({ guest }: BlessingCardProps) {
  const theme = getCardTheme(guest.customization.templateId);
  const images = guest.customization.images && guest.customization.images.length > 0
    ? guest.customization.images
    : [DEFAULT_IMAGE];

  const paperTexture = `
    repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(45, 41, 37, 0.01) 2px, rgba(45, 41, 37, 0.01) 4px),
    repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(45, 41, 37, 0.01) 2px, rgba(45, 41, 37, 0.01) 4px),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.03' /%3E%3C/svg%3E")
  `;

  return (
    <div
      id="blessing-card"
      className="w-full mx-auto animate-fadeIn max-w-[35rem]"
    >
      {/* 主卡片容器 */}
      <div
        className="relative overflow-hidden"
        style={{
          borderRadius: '1.5rem',
          backgroundColor: theme.card.background,
          backgroundImage: paperTexture,
          boxShadow: theme.card.boxShadow
        }}
      >
        {/* 頂部裝飾區 */}
        <div style={{ padding: '2.5rem 1.5rem 1rem' }}>
          <BorderOrnament accent={theme.accent} />
        </div>

        {/* 主標題區 — 全寬 */}
        <div className="text-center" style={{ padding: '0 3rem 1.25rem' }}>
          <h2
            className="mb-3 font-serif"
            style={{
              fontSize: 'clamp(2rem, 5vw, 2.5rem)',
              lineHeight: '1.2',
              letterSpacing: '0.05em',
              fontWeight: '600',
              color: theme.text.title
            }}
          >
            給 {guest.name}
          </h2>
          <p
            className="font-serif italic uppercase"
            style={{
              fontSize: 'clamp(0.875rem, 2vw, 1rem)',
              lineHeight: '1.5',
              letterSpacing: '0.1em',
              color: theme.text.subtitle
            }}
          >
            A Message from Our Hearts
          </p>
          <DividerElegant className="mt-6 mx-auto" accent={theme.accent} />
        </div>

        {/* 中間內容區 — 圖片左 + 訊息右 */}
        <div style={{ padding: '0 1.75rem 1.25rem' }}>
          <div
            className="flex flex-col overflow-hidden"
            style={{
              borderRadius: '0.75rem',
              border: `1px solid ${theme.message.border}`,
              boxShadow: theme.message.boxShadow,
            }}
          >
            {/* 圖片區 */}
            <div>
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`回憶 ${index + 1}`}
                  crossOrigin="anonymous"
                  className="w-full object-cover"
                />
              ))}
            </div>

            {/* 祝福訊息 */}
            <div
              className="flex flex-col justify-center"
              style={{
                backgroundColor: theme.message.background,
                padding: 'clamp(1.5rem, 4vw, 2.5rem) clamp(1.5rem, 3vw, 2rem)',
              }}
            >
              <p
                className="whitespace-pre-wrap font-serif"
                style={{
                  fontSize: 'clamp(1.125rem, 3vw, 1.25rem)',
                  lineHeight: '1.8',
                  letterSpacing: '0.02em',
                  color: theme.text.body
                }}
              >
                {guest.customization.message}
              </p>
            </div>
          </div>
        </div>

        {/* 簽名區 — 全寬 */}
        <div
          className="px-6 sm:px-12 text-center"
          style={{ paddingBottom: '1.5rem' }}
        >
          <div
            className="border-t text-center"
            style={{
              borderColor: theme.message.border,
              paddingTop: '1.5rem'
            }}
          >
            <DividerElegant className="mb-4 mx-auto" accent={theme.accent} />
            <p
              className="font-serif"
              style={{
                fontSize: 'clamp(1.5rem, 3.5vw, 1.75rem)',
                lineHeight: '1.3',
                letterSpacing: '0.08em',
                fontWeight: '500',
                color: theme.text.signatureName
              }}
            >
              Alex & Jamie
            </p>
            <p
              className="mt-2 font-serif italic"
              style={{
                fontSize: '0.875rem',
                lineHeight: '1.5',
                letterSpacing: '0.12em',
                color: theme.text.signatureSubtitle
              }}
            >
              With Love & Gratitude
            </p>
          </div>
        </div>

        {/* 四角裝飾 */}
        <CornerOrnament position="top-left" accent={theme.accent} />
        <CornerOrnament position="top-right" accent={theme.accent} />
        <CornerOrnament position="bottom-left" accent={theme.accent} />
        <CornerOrnament position="bottom-right" accent={theme.accent} />
      </div>
    </div>
  );
}

