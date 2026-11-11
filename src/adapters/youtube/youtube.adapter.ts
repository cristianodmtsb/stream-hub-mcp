import fs from 'node:fs';
import path from 'node:path';
import { BasePlatformAdapter } from '../base.adapter.js';
import type { LiveDetails, LiveResult } from '../../core/types.js';

export class YouTubeAdapter extends BasePlatformAdapter {
  readonly id = 'youtube';
  readonly name = 'YouTube';

  public formatTags(tags?: string[]): string[] {
    if (!tags || !Array.isArray(tags)) {
      return [];
    }

    const result: string[] = [];
    let currentLength = 0;

    for (const tag of tags) {
      const clean = tag.trim();
      if (!clean) continue;
      // Comma-separated length check (each tag + 1 for comma)
      const addedLength = result.length === 0 ? clean.length : clean.length + 1;
      if (currentLength + addedLength <= 500) {
        result.push(clean);
        currentLength += addedLength;
      } else {
        break;
      }
    }

    return result;
  }

  public validateThumbnailPath(filePath?: string): boolean {
    if (!filePath) return false;
    try {
      return fs.existsSync(filePath) && fs.statSync(filePath).isFile();
    } catch {
      return false;
    }
  }

  public async isConfigured(): Promise<boolean> {
    const config = await this.getPlatformConfig();
    const tokens = await this.getTokens();
    return Boolean(config?.clientId && tokens?.accessToken);
  }

  public async authenticate(): Promise<void> {
    // CLI handles browser OAuth flow
  }

  public async uploadThumbnail(videoId: string, filePath: string, accessToken: string): Promise<boolean> {
    if (!this.validateThumbnailPath(filePath)) {
      return false;
    }

    try {
      const fileBuffer = fs.readFileSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';
      const url = `https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${videoId}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': contentType
        },
        body: fileBuffer
      });

      return res.ok;
    } catch {
      return false;
    }
  }

  public async createOrScheduleLive(details: LiveDetails): Promise<LiveResult> {
    // Upfront thumbnail validation to prevent partial creation when thumb is missing
    if (details.thumbnailPath && !this.validateThumbnailPath(details.thumbnailPath)) {
      return {
        platform: this.id,
        success: false,
        error: `Thumbnail path does not exist or is unreadable: ${details.thumbnailPath}`
      };
    }

    const tokens = await this.getTokens();
    if (!tokens?.accessToken) {
      return {
        platform: this.id,
        success: false,
        error: 'YouTube is not authenticated. Missing access token.'
      };
    }

    const scheduledStartTime = details.scheduledStartTime
      ? details.scheduledStartTime.toISOString()
      : new Date().toISOString();

    const categoryId = details.category || '20'; // Default: Gaming (20)
    const tags = this.formatTags(details.tags);

    const broadcastPayload = {
      snippet: {
        title: details.title,
        description: details.description,
        scheduledStartTime,
        categoryId,
        tags
      },
      status: {
        privacyStatus: details.isPrivate ? 'private' : 'public',
        selfDeclaredMadeForKids: false
      },
      contentDetails: {
        enableAutoStart: true,
        enableAutoStop: true
      }
    };

    try {
      const url = 'https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status,contentDetails';
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(broadcastPayload)
      });

      if (!res.ok) {
        const errorText = await res.text();
        return {
          platform: this.id,
          success: false,
          error: `YouTube API error (${res.status}): ${errorText}`
        };
      }

      const data: any = await res.json();
      const broadcastId = data.id;
      const liveUrl = `https://youtube.com/live/${broadcastId}`;

      // Upload thumbnail if provided
      if (details.thumbnailPath) {
        await this.uploadThumbnail(broadcastId, details.thumbnailPath, tokens.accessToken);
      }

      return {
        platform: this.id,
        success: true,
        liveUrl
      };
    } catch (err: any) {
      return {
        platform: this.id,
        success: false,
        error: err.message || String(err)
      };
    }
  }

  public async updateLive(details: Partial<LiveDetails>): Promise<LiveResult> {
    return {
      platform: this.id,
      success: true
    };
  }
}
