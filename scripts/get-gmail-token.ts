/**
 * Gmail OAuth2 Refresh Token 取得腳本
 *
 * 使用方式:
 * 1. 到 Google Cloud Console 建立 OAuth2 Client (Desktop App)
 * 2. 取得 Client ID 和 Client Secret
 * 3. 執行: npx tsx scripts/get-gmail-token.ts
 * 4. 依提示輸入 Client ID / Secret，開啟瀏覽器授權
 * 5. 將取得的 Refresh Token 貼入 .env.local
 */

import { createServer, type IncomingMessage, type ServerResponse } from 'http';
import { URL } from 'url';
import { createInterface } from 'readline';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const REDIRECT_PORT = 3456;
const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}/callback`;
const SCOPES = ['https://mail.google.com/'];

function askQuestion(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function buildAuthUrl(clientId: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

async function exchangeCodeForTokens(
  code: string,
  clientId: string,
  clientSecret: string
): Promise<{ access_token: string; refresh_token: string }> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Token exchange failed: ${response.status} — ${errorBody}`);
  }

  return response.json();
}

function waitForAuthCode(): Promise<string> {
  return new Promise((resolve, reject) => {
    const server = createServer((req: IncomingMessage, res: ServerResponse) => {
      const url = new URL(req.url ?? '/', `http://localhost:${REDIRECT_PORT}`);

      if (url.pathname !== '/callback') {
        res.writeHead(404);
        res.end('Not found');
        return;
      }

      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');

      if (error) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>授權失敗</h1><p>請關閉此頁面重新嘗試。</p>');
        server.close();
        reject(new Error(`Authorization error: ${error}`));
        return;
      }

      if (!code) {
        res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>缺少授權碼</h1>');
        return;
      }

      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>授權成功！</h1><p>請回到終端機查看 Refresh Token。</p>');
      server.close();
      resolve(code);
    });

    server.listen(REDIRECT_PORT, () => {
      // server started, waiting for callback
    });

    server.on('error', (err) => {
      reject(new Error(`Failed to start callback server: ${err.message}`));
    });
  });
}

async function main() {
  console.log('=== Gmail OAuth2 Refresh Token 取得工具 ===\n');
  console.log('請先到 Google Cloud Console 建立 OAuth2 Client (Desktop App)\n');

  const clientId = await askQuestion('請輸入 Client ID: ');
  if (!clientId) {
    console.error('Client ID 不能為空');
    process.exit(1);
  }

  const clientSecret = await askQuestion('請輸入 Client Secret: ');
  if (!clientSecret) {
    console.error('Client Secret 不能為空');
    process.exit(1);
  }

  const authUrl = buildAuthUrl(clientId);
  console.log('\n請在瀏覽器中開啟以下網址進行授權:\n');
  console.log(authUrl);
  console.log('\n等待授權回調...');

  try {
    const code = await waitForAuthCode();
    console.log('\n收到授權碼，正在換取 tokens...');

    const tokens = await exchangeCodeForTokens(code, clientId, clientSecret);

    console.log('\n=== 成功！請將以下內容加入 .env.local ===\n');
    console.log(`GMAIL_CLIENT_ID=${clientId}`);
    console.log(`GMAIL_CLIENT_SECRET=${clientSecret}`);
    console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log('GMAIL_SENDER_EMAIL=你的Gmail地址');
    console.log('\n完成！');
  } catch (error) {
    console.error('\n取得 token 失敗:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
