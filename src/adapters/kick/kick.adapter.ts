import { BasePlatformAdapter } from '../base.adapter.js';
import type { LiveDetails, LiveResult } from '../../core/types.js';

export class KickAdapter extends BasePlatformAdapter {
  readonly id = 'kick';
  readonly name = 'Kick';

  public normalizeSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
  }

  public async isConfigured(): Promise<boolean> {
    const config = await this.getPlatformConfig();
    const tokens = await this.getTokens();
    return Boolean(config?.channelSlug && (tokens?.accessToken || config?.apiKey));
  }

  public async authenticate(): Promise<void> {
    // Handled in CLI setup / token save
  }

  public async updateLive(details: Partial<LiveDetails>): Promise<LiveResult> {
    const config = await this.getPlatformConfig();
    const tokens = await this.getTokens();

    const channelSlug = config?.channelSlug;
    const token = tokens?.accessToken || config?.apiKey;

    if (!channelSlug || !token) {
      return {
        platform: this.id,
        success: false,
        error: 'Kick is not configured. Missing channelSlug or API token.'
      };
    }

    const payload: Record<string, any> = {};
    if (details.title) {
      payload.title = details.title;
    }
    if (details.game || details.category) {
      payload.category = details.game ? this.normalizeSlug(details.game) : details.category;
    }

    try {
      const url = `https://kick.com/api/v1/channels/${channelSlug}`;
      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorText = await res.text();
        return {
          platform: this.id,
          success: false,
          error: `Kick API error (${res.status}): ${errorText}`
        };
      }

      return {
        platform: this.id,
        success: true,
        liveUrl: `https://kick.com/${channelSlug}`
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
