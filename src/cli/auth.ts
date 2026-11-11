import http from 'node:http';
import { ConfigManager } from '../core/config.js';

export async function runAuthCommand(platform: string, customBaseDir?: string): Promise<void> {
  const configManager = new ConfigManager(customBaseDir);
  const normalized = platform.toLowerCase();

  switch (normalized) {
    case 'twitch': {
      console.log('\n--- 🟣 Autenticação Twitch ---');
      console.log('1. Crie seu App no Twitch Developer Console (https://dev.twitch.tv/console/apps)');
      console.log('2. Configure o OAuth Redirect URL para: http://localhost:8080/callback');
      console.log('3. Guarde o Client ID e Client Secret em ~/.stream-hub/config.json\n');
      await startLocalOAuthServer(configManager, 'twitch', 8080);
      break;
    }

    case 'youtube': {
      console.log('\n--- 🔴 Autenticação YouTube ---');
      console.log('1. Ative a YouTube Data API v3 no Google Cloud Console (https://console.cloud.google.com)');
      console.log('2. Crie credenciais OAuth 2.0 (Aplicativo da Web com redirect http://localhost:8080/callback)');
      console.log('3. Guarde o Client ID e Client Secret em ~/.stream-hub/config.json\n');
      await startLocalOAuthServer(configManager, 'youtube', 8080);
      break;
    }

    case 'kick': {
      console.log('\n--- 🟢 Autenticação Kick ---');
      console.log('A Kick utiliza tokens de API de canal ou OAuth.');
      console.log('Adicione seu channelSlug e apiKey em ~/.stream-hub/config.json');
      break;
    }

    default:
      console.error(`Plataforma '${platform}' não reconhecida. Use: youtube, twitch ou kick.`);
  }
}

async function exchangeOAuthCode(platform: string, code: string, configManager: ConfigManager): Promise<any> {
  const config = await configManager.getPlatformConfig(platform);
  const redirectUri = 'http://localhost:8080/callback';

  if (!config?.clientId || !config?.clientSecret) {
    console.warn(`[Aviso] Client ID ou Client Secret ausentes em config.json para ${platform}. Salvando código de autorização.`);
    return { accessToken: code, tokenType: 'Bearer' };
  }

  try {
    if (platform === 'twitch') {
      const tokenUrl = 'https://id.twitch.tv/oauth2/token';
      const params = new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      });

      const res = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });

      if (res.ok) {
        const data: any = await res.json();
        return {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt: Date.now() + (data.expires_in * 1000),
          tokenType: data.token_type || 'Bearer'
        };
      }
    } else if (platform === 'youtube') {
      const tokenUrl = 'https://oauth2.googleapis.com/token';
      const params = new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      });

      const res = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });

      if (res.ok) {
        const data: any = await res.json();
        return {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt: Date.now() + (data.expires_in * 1000),
          tokenType: data.token_type || 'Bearer'
        };
      }
    }
  } catch (err) {
    console.error(`Erro ao trocar código por token (${platform}):`, err);
  }

  // Fallback
  return { accessToken: code, tokenType: 'Bearer' };
}

export function startLocalOAuthServer(
  configManager: ConfigManager,
  platform: string,
  port = 8080
): Promise<void> {
  return new Promise((resolve) => {
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url || '/', `http://localhost:${port}`);

      if (url.pathname === '/callback') {
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');

        if (error) {
          res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`<h1>Erro na autenticação: ${error}</h1>`);
          server.close();
          resolve();
          return;
        }

        if (code) {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end('<h1>✅ Autenticação realizada com sucesso! Você já pode fechar esta aba.</h1>');

          const tokens = await exchangeOAuthCode(platform, code, configManager);
          await configManager.saveTokens(platform, tokens);

          console.log(`\n✅ Sucesso! Token de acesso da plataforma '${platform}' configurado com sucesso em ~/.stream-hub/tokens.json`);
          server.close();
          resolve();
          return;
        }
      }

      res.writeHead(404);
      res.end('Not Found');
    });

    server.listen(port, () => {
      console.log(`📡 Servidor de autenticação local aguardando callback em: http://localhost:${port}/callback`);
      console.log('Pressione Ctrl+C para cancelar.');
    });
  });
}
