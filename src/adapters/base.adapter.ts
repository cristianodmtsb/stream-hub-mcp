import type { PlatformAdapter, LiveDetails, LiveResult } from '../core/types.js';
import type { ConfigManager } from '../core/config.js';

export abstract class BasePlatformAdapter implements PlatformAdapter {
  abstract readonly id: string;
  abstract readonly name: string;

  constructor(protected configManager: ConfigManager) {}

  abstract isConfigured(): Promise<boolean>;
  abstract authenticate(): Promise<void>;
  abstract createOrScheduleLive(details: LiveDetails): Promise<LiveResult>;
  abstract updateLive(details: Partial<LiveDetails>): Promise<LiveResult>;

  protected getPlatformConfig() {
    return this.configManager.getPlatformConfig(this.id);
  }

  protected getTokens() {
    return this.configManager.getTokens(this.id);
  }

  protected saveTokens(tokens: any) {
    return this.configManager.saveTokens(this.id, tokens);
  }
}
