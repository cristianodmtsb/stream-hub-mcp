import { BasePlatformAdapter } from '../base.adapter.js';
import type { LiveDetails, LiveResult } from '../../core/types.js';

export class TwitchAdapter extends BasePlatformAdapter {
  readonly id = 'twitch';
  readonly name = 'Twitch';

  public sanitizeTitle(title: string): string {
    if (title.length <= 140) {
      return title;
    }
    const truncated = title.slice(0, 137);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 100) {
      return `${truncated.slice(0, lastSpace)}...`;
    }
    return `${truncated}...`;
  }

  public sanitizeTags(tags?: string[]): string[] {
    if (!tags || !Array.isArray(tags)) {
      return [];
    }
    return tags
      .map(tag => tag.replace(/[^a-zA-Z0-9_\s]/g, '').trim())
      .filter(tag => tag.length > 0)
      .map(tag => tag.slice(0, 25))
      .slice(0, 10);
  }

  public async isConfigured(): Promise<boolean> {
    const config = await this.getPlatformConfig();
    const tokens = await this.getTokens();
    return Boolean(config?.clientId && tokens?.accessToken);
  }

  public async authenticate(): Promise<void> {
    // CLI handles browser OAuth flow
  }

  public async searchGame(gameName: string): Promise<{ id: string; name: string } | null> {
    const config = await this.getPlatformConfig();
    const tokens = await this.getTokens();
    if (!config?.clientId || !tokens?.accessToken) {
      return null;
    }

    try {
      const url = `https://api.twitch.tv/helix/games?name=${encodeURIComponent(gameName)}`;
      const res = await fetch(url, {
        headers: {
          'Client-Id': config.clientId,
          'Authorization': `Bearer ${tokens.accessToken}`
        }
      });

      if (!res.ok) {
        return null;
      }

      const data: any = await res.json();
      if (data.data && data.data.length > 0) {
        return {
          id: data.data[0].id,
          name: data.data[0].name
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  public async updateLive(details: Partial<LiveDetails>): Promise<LiveResult> {
    const config = await this.getPlatformConfig();
    const tokens = await this.getTokens();

    if (!config?.clientId || !tokens?.accessToken) {
      return {
        platform: this.id,
        success: false,
        error: 'Twitch is not configured. Missing Client ID or Access Token.'
      };
    }

    const broadcasterId = config.channelId || config.broadcasterId;
    if (!broadcasterId) {
      return {
        platform: this.id,
        success: false,
        error: 'Missing Twitch broadcaster/channel ID in config.'
      };
    }

    const payload: Record<string, any> = {};

    if (details.title) {
      payload.title = this.sanitizeTitle(details.title);
    }

    if (details.tags && details.tags.length > 0) {
      payload.tags = this.sanitizeTags(details.tags);
    }

    if (details.game) {
      const matchedGame = await this.searchGame(details.game);
      if (matchedGame) {
        payload.game_id = matchedGame.id;
      }
    }

    try {
      const url = `https://api.twitch.tv/helix/channels?broadcaster_id=${broadcasterId}`;
      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Client-Id': config.clientId,
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorText = await res.text();
        return {
          platform: this.id,
          success: false,
          error: `Twitch API error (${res.status}): ${errorText}`
        };
      }

      return {
        platform: this.id,
        success: true,
        liveUrl: config.channelName ? `https://twitch.tv/${config.channelName}` : undefined
      };
    } catch (err: any) {
      return {
        platform: this.id,
        success: false,
        error: err.message || String(err)
      };
    }
  }

  public async createOrScheduleLive(details: LiveDetails): Promise<LiveResult> {
    return this.updateLive(details);
  }
}
