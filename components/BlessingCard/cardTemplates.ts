export interface CardTheme {
  id: string;
  name: string;
  card: {
    background: string;
    boxShadow: string;
  };
  message: {
    background: string;
    border: string;
    boxShadow: string;
  };
  text: {
    title: string;
    subtitle: string;
    body: string;
    signatureName: string;
    signatureSubtitle: string;
  };
  accent: string;
  ornamentOpacity: number;
}

const templates: Record<string, CardTheme> = {
  // 粉黃
  classic: {
    id: 'classic',
    name: '粉黃',
    card: {
      background: '#fffbf0',
      boxShadow: `
        0 1px 2px rgba(180, 150, 80, 0.06),
        0 8px 16px rgba(180, 150, 80, 0.08),
        0 24px 48px rgba(180, 150, 80, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.6)
      `,
    },
    message: {
      background: '#fef3d4',
      border: '#f5dfa0',
      boxShadow: `
        inset 0 1px 3px rgba(180, 150, 80, 0.06),
        0 1px 0 rgba(255, 255, 255, 0.8)
      `,
    },
    text: {
      title: '#6b5a2a',
      subtitle: '#8a7540',
      body: '#8a7540',
      signatureName: '#6b5a2a',
      signatureSubtitle: '#b8a060',
    },
    accent: '#c9a84c',
    ornamentOpacity: 0.3,
  },

  // 粉紅
  rose: {
    id: 'rose',
    name: '粉紅',
    card: {
      background: '#fff5f7',
      boxShadow: `
        0 1px 2px rgba(180, 80, 120, 0.06),
        0 8px 16px rgba(180, 80, 120, 0.08),
        0 24px 48px rgba(180, 80, 120, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.6)
      `,
    },
    message: {
      background: '#fde8ec',
      border: '#f5c0cc',
      boxShadow: `
        inset 0 1px 3px rgba(180, 80, 120, 0.06),
        0 1px 0 rgba(255, 255, 255, 0.8)
      `,
    },
    text: {
      title: '#7a3050',
      subtitle: '#9a5068',
      body: '#9a5068',
      signatureName: '#7a3050',
      signatureSubtitle: '#c08898',
    },
    accent: '#d4778a',
    ornamentOpacity: 0.3,
  },

  // 粉藍
  midnight: {
    id: 'midnight',
    name: '粉藍',
    card: {
      background: '#f0f7ff',
      boxShadow: `
        0 1px 2px rgba(80, 120, 180, 0.06),
        0 8px 16px rgba(80, 120, 180, 0.08),
        0 24px 48px rgba(80, 120, 180, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.6)
      `,
    },
    message: {
      background: '#dbeafe',
      border: '#bfdbfe',
      boxShadow: `
        inset 0 1px 3px rgba(80, 120, 180, 0.06),
        0 1px 0 rgba(255, 255, 255, 0.8)
      `,
    },
    text: {
      title: '#2a5080',
      subtitle: '#4a6fa0',
      body: '#4a6fa0',
      signatureName: '#2a5080',
      signatureSubtitle: '#7aa0c8',
    },
    accent: '#6699cc',
    ornamentOpacity: 0.3,
  },

  // 粉綠
  spring: {
    id: 'spring',
    name: '粉綠',
    card: {
      background: '#f0fff4',
      boxShadow: `
        0 1px 2px rgba(80, 150, 100, 0.06),
        0 8px 16px rgba(80, 150, 100, 0.08),
        0 24px 48px rgba(80, 150, 100, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.6)
      `,
    },
    message: {
      background: '#dcfce8',
      border: '#bbf0cc',
      boxShadow: `
        inset 0 1px 3px rgba(80, 150, 100, 0.06),
        0 1px 0 rgba(255, 255, 255, 0.8)
      `,
    },
    text: {
      title: '#2d6b45',
      subtitle: '#4d8a60',
      body: '#4d8a60',
      signatureName: '#2d6b45',
      signatureSubtitle: '#80b899',
    },
    accent: '#5fb878',
    ornamentOpacity: 0.3,
  },

  // 粉橘
  luxe: {
    id: 'luxe',
    name: '粉橘',
    card: {
      background: '#fff8f0',
      boxShadow: `
        0 1px 2px rgba(190, 130, 70, 0.06),
        0 8px 16px rgba(190, 130, 70, 0.08),
        0 24px 48px rgba(190, 130, 70, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.6)
      `,
    },
    message: {
      background: '#fde8d4',
      border: '#f5c8a0',
      boxShadow: `
        inset 0 1px 3px rgba(190, 130, 70, 0.06),
        0 1px 0 rgba(255, 255, 255, 0.8)
      `,
    },
    text: {
      title: '#7a5030',
      subtitle: '#a07050',
      body: '#a07050',
      signatureName: '#7a5030',
      signatureSubtitle: '#cc9968',
    },
    accent: '#d4904c',
    ornamentOpacity: 0.3,
  },
};

export function getCardTheme(templateId?: string): CardTheme {
  return templates[templateId || 'classic'] || templates.classic;
}

export const TEMPLATE_IDS = Object.keys(templates);
