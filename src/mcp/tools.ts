import path from 'node:path';
import fs from 'node:fs';
import { ConfigManager } from '../core/config.js';
import { AdapterRegistry } from '../core/registry.js';
import { TemplateEngine } from '../core/template.js';
import { YouTubeAdapter } from '../adapters/youtube/youtube.adapter.js';
import { TwitchAdapter } from '../adapters/twitch/twitch.adapter.js';
import { KickAdapter } from '../adapters/kick/kick.adapter.js';
import { getAuthUrl, openBrowser, startLocalOAuthServer } from '../cli/auth.js';
import type { LiveDetails, MultiPlatformResult, StreamTemplate } from '../core/types.js';

export interface PreviewParams {
  title: string;
  description: string;
  partners?: string;
  game?: string;
  templateName?: string;
  customTags?: string[];
  thumbnailPath?: string;
}

export interface LivePreview {
  title: string;
  renderedDescription: string;
  categories: Record<string, string>;
  tags: string[];
  game?: string;
  thumbnailPath?: string;
}

export class StreamOrchestrator {
  public registry: AdapterRegistry;
  public configManager: ConfigManager;

  constructor(configManager?: ConfigManager) {
    this.configManager = configManager || new ConfigManager();
    this.registry = new AdapterRegistry();

    // Register built-in adapters
    this.registry.register(new YouTubeAdapter(this.configManager));
    this.registry.register(new TwitchAdapter(this.configManager));
    this.registry.register(new KickAdapter(this.configManager));
  }

  public getTemplatesDir(): string {
    const dir = path.join(this.configManager.getBaseDir(), 'templates');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }

  public getTemplates(): StreamTemplate[] {
    const userDir = this.getTemplatesDir();
    const userTemplates = TemplateEngine.listTemplates(userDir);

    // Also look for bundled templates in the repository
    const bundledDir = path.resolve(process.cwd(), 'templates');
    const bundledTemplates = fs.existsSync(bundledDir) ? TemplateEngine.listTemplates(bundledDir) : [];

    // User templates override bundled ones by name
    const templateMap = new Map<string, StreamTemplate>();
    for (const t of bundledTemplates) {
      templateMap.set(t.name.toLowerCase(), t);
    }
    for (const t of userTemplates) {
      templateMap.set(t.name.toLowerCase(), t);
    }

    if (templateMap.size > 0) {
      return Array.from(templateMap.values());
    }

    // Fallback built-in template
    return [
      {
        name: 'default',
        frontmatter: {
          categories: {
            youtube: '20',
            twitch: 'Software and Game Development',
            kick: 'software-development'
          },
          default_tags: ['live', 'games', 'gameplay']
        },
        rawBody: `{{description}}\n\n---\n### 🤝 Participantes & Parceiros:\n{{partners}}\n\n---\n### 🔗 Redes Sociais:\n- Twitch: https://twitch.tv/\n- YouTube: https://youtube.com/@\n- Kick: https://kick.com/`
      }
    ];
  }

  public getTemplateByName(name = 'default'): StreamTemplate {
    const templates = this.getTemplates();
    const found = templates.find(t => t.name.toLowerCase() === name.toLowerCase());
    return found || templates[0];
  }

  public async previewLiveMetadata(params: PreviewParams): Promise<LivePreview> {
    const template = this.getTemplateByName(params.templateName || 'default');

    const variables: Record<string, string> = {
      description: params.description || '',
      partners: params.partners || '',
      title: params.title || '',
      game: params.game || ''
    };

    const rendered = TemplateEngine.render(template, variables);

    // Merge tags
    const defaultTags = template.frontmatter.default_tags || [];
    const customTags = params.customTags || [];
    const gameTags = params.game ? [params.game, `${params.game} Ao Vivo`, `Gameplay ${params.game}`] : [];

    const tags = Array.from(new Set([...defaultTags, ...gameTags, ...customTags]));

    // Format categories
    const categories: Record<string, string> = {
      youtube: params.game ? '20' : (template.frontmatter.categories?.['youtube'] || '20'),
      twitch: params.game ? params.game : (template.frontmatter.categories?.['twitch'] || 'Software and Game Development'),
      kick: params.game ? params.game : (template.frontmatter.categories?.['kick'] || 'software-development')
    };

    return {
      title: params.title,
      renderedDescription: rendered.body,
      categories,
      tags,
      game: params.game,
      thumbnailPath: params.thumbnailPath
    };
  }

  public async authenticatePlatform(
    platform: string,
    credentials?: { channelSlug?: string; apiKey?: string; clientId?: string; clientSecret?: string }
  ): Promise<{ success: boolean; message: string; authUrl?: string }> {
    const norm = platform.toLowerCase();

    // If credentials are provided directly in chat, save them automatically
    if (credentials) {
      if (norm === 'kick') {
        if (!credentials.channelSlug || !credentials.apiKey) {
          return {
            success: false,
            message: 'Para configurar a Kick, preciso do seu `channelSlug` (nome do canal) e da sua `apiKey`. Exemplo: `/auth-kick canal chave123`'
          };
        }
        await this.configManager.savePlatformConfig('kick', {
          channelSlug: credentials.channelSlug,
          apiKey: credentials.apiKey
        });
        return {
          success: true,
          message: `✅ Kick configurada com sucesso para o canal '${credentials.channelSlug}'! Já pode transmitir.`
        };
      }

      // If YouTube or Twitch credentials provided
      if (credentials.clientId || credentials.clientSecret) {
        await this.configManager.savePlatformConfig(norm, {
          clientId: credentials.clientId,
          clientSecret: credentials.clientSecret
        });
      }
    }

    const config = await this.configManager.getPlatformConfig(norm);

    if (norm === 'kick') {
      if (!config?.channelSlug || !config?.apiKey) {
        return {
          success: false,
          message: 'A Kick precisa do seu nome de canal (channelSlug) e chave de API. Me informe os dois (ex: "Configurar kick: canal x, chave y") que salvo para você!'
        };
      }
      return {
        success: true,
        message: `✅ Kick já está configurada para o canal '${config.channelSlug}'.`
      };
    }

    if (!config?.clientId) {
      return {
        success: false,
        message: `Para autenticar ${platform.toUpperCase()}, informe seu Client ID e Client Secret aqui no chat (ou configure em ~/.stream-hub/config.json).`
      };
    }

    const authUrl = getAuthUrl(norm, config.clientId);
    openBrowser(authUrl);

    // Start OAuth listener asynchronously
    startLocalOAuthServer(this.configManager, norm, 8080).catch(() => {});

    return {
      success: true,
      authUrl,
      message: `Abri o navegador para você autorizar o ${platform.toUpperCase()}. Caso não tenha aberto, clique neste link: ${authUrl}`
    };
  }

  public async listPlatforms(): Promise<{ id: string; name: string; isConfigured: boolean }[]> {
    const adapters = this.registry.getAll();
    const list = [];
    for (const adapter of adapters) {
      list.push({
        id: adapter.id,
        name: adapter.name,
        isConfigured: await adapter.isConfigured()
      });
    }
    return list;
  }

  public async prepareLive(
    targetPlatforms: string[],
    params: PreviewParams & { isPrivate?: boolean }
  ): Promise<MultiPlatformResult> {
    const preview = await this.previewLiveMetadata(params);

    const details: LiveDetails = {
      title: preview.title,
      description: preview.renderedDescription,
      game: preview.game,
      tags: preview.tags,
      thumbnailPath: preview.thumbnailPath,
      isPrivate: params.isPrivate
    };

    return this.registry.dispatchPrepareLive(targetPlatforms, details);
  }
}
