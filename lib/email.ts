import nodemailer from 'nodemailer';

// 部署時請設定 NEXT_PUBLIC_SITE_URL（e.g. https://wedding.example.tw）。
// 未設定 → 啟動 send-email 時 throw，避免寄出指向佔位網域的死連結。
const PLACEHOLDER_SITE_URL = 'https://your-domain.example.com';
const CARD_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? PLACEHOLDER_SITE_URL;
const SENDER_NAME = '來自Alex & Jamie的感謝';

interface EmailConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  senderEmail: string;
}

function getEmailConfig(): EmailConfig {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const senderEmail = process.env.GMAIL_SENDER_EMAIL;

  if (!clientId || !clientSecret || !refreshToken || !senderEmail) {
    throw new Error(
      'Missing Gmail configuration. Required: GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, GMAIL_SENDER_EMAIL'
    );
  }

  return { clientId, clientSecret, refreshToken, senderEmail };
}

function createTransporter(config: EmailConfig) {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: config.senderEmail,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      refreshToken: config.refreshToken,
    },
  });
}

function buildEmailHtml(guestName: string, cardPageUrl: string, hasImage: boolean): string {
  const imageSection = hasImage
    ? `
          <!-- Card Image -->
          <tr>
            <td align="center" style="padding: 0 30px 24px;">
              <img src="cid:card-image" alt="${guestName} 的婚禮祝福卡片" style="max-width: 100%; border-radius: 8px; box-shadow: 0 2px 12px rgba(139, 115, 85, 0.15);" />
            </td>
          </tr>`
    : '';

  return `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #faf9f7; font-family: 'Georgia', 'Times New Roman', serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #faf9f7;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(139, 115, 85, 0.1);">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 48px 40px 24px;">
              <div style="font-size: 28px; margin-bottom: 12px; color: #c9a84c; letter-spacing: 4px;">&#10045; &#10045; &#10045;</div>
              <h1 style="margin: 0; font-size: 24px; color: #8b7355; font-weight: normal; letter-spacing: 2px;">
                婚禮祝福卡片
              </h1>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td align="center" style="padding: 0 60px;">
              <div style="height: 1px; background: linear-gradient(to right, transparent, #c9a84c, transparent);"></div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td align="center" style="padding: 32px 40px;">
              <p style="margin: 0 0 8px; font-size: 18px; color: #5a4a3a; line-height: 1.8;">
                親愛的 <strong style="color: #8b7355;">${guestName}</strong>
              </p>
              <p style="margin: 0; font-size: 16px; color: #7a6a5a; line-height: 1.8;">
                您有一張專屬的婚禮祝福卡片<br>等待您來開啟
              </p>
            </td>
          </tr>
${imageSection}
          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding: 8px 40px 40px;">
              <a href="${cardPageUrl}" target="_blank" style="display: inline-block; padding: 14px 40px; background-color: #c9a84c; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; letter-spacing: 1px; font-weight: bold;">
                開啟卡片
              </a>
            </td>
          </tr>

          <!-- Footer Divider -->
          <tr>
            <td align="center" style="padding: 0 60px;">
              <div style="height: 1px; background: linear-gradient(to right, transparent, #e8ddd0, transparent);"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 24px 40px 36px;">
              <p style="margin: 0; font-size: 13px; color: #b0a090; line-height: 1.6;">
                此信件由婚禮祝福卡片系統自動發送
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildCardPageUrl(guestId: string): string {
  return `${CARD_BASE_URL}/card/${guestId}`;
}

export async function sendWeddingCardEmail(
  recipientEmail: string,
  guestName: string,
  cardPageUrl: string,
  cardImageBase64?: string
): Promise<void> {
  if (CARD_BASE_URL === PLACEHOLDER_SITE_URL) {
    throw new Error(
      'NEXT_PUBLIC_SITE_URL 未設定。請在 .env.local 設定你的部署網域，否則寄出的卡片連結會指向佔位網域。'
    );
  }

  const config = getEmailConfig();
  const transporter = createTransporter(config);

  const hasImage = Boolean(cardImageBase64);
  const html = buildEmailHtml(guestName, cardPageUrl, hasImage);

  const attachments = cardImageBase64
    ? [
        {
          filename: `wedding-card-${guestName}.png`,
          content: cardImageBase64.replace(/^data:image\/png;base64,/, ''),
          encoding: 'base64' as const,
          cid: 'card-image',
        },
      ]
    : [];

  await transporter.sendMail({
    from: `${SENDER_NAME} <${config.senderEmail}>`,
    to: recipientEmail,
    subject: `${guestName}，您有一張婚禮感謝小卡`,
    html,
    attachments,
  });
}
