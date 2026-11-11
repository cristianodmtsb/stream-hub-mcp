import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import type { PlatformConfig, PlatformTokens } from './types.js';

export interface AppConfig {
  defaultPlatform?: string;
  platforms: Record<string, PlatformConfig>;
}

export class ConfigManager {
  private baseDir: string;
  private configFile: string;
  private tokensFile: string;

  constructor(customBaseDir?: string) {
    this.baseDir = customBaseDir || path.join(os.homedir(), '.stream-hub');
    this.configFile = path.join(this.baseDir, 'config.json');
    this.tokensFile = path.join(this.baseDir, 'tokens.json');
    this.ensureDirectory();
  }

  public getBaseDir(): string {
    return this.baseDir;
  }

  private ensureDirectory(): void {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true, mode: 0o700 });
    }
  }

  private setSecureFilePermissions(filePath: string): void {
    if (process.platform !== 'win32' && fs.existsSync(filePath)) {
      try {
        fs.chmodSync(filePath, 0o600);
      } catch {
        // Ignore permission change errors on unsupported filesystems
      }
    }
  }

  public async getFullConfig(): Promise<AppConfig> {
    if (!fs.existsSync(this.configFile)) {
      return { platforms: {} };
    }
    try {
      const data = fs.readFileSync(this.configFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return { platforms: {} };
    }
  }

  public async getPlatformConfig(platform: string): Promise<PlatformConfig | undefined> {
    const config = await this.getFullConfig();
    return config.platforms[platform];
  }

  public async savePlatformConfig(platform: string, platformConfig: PlatformConfig): Promise<void> {
    const current = await this.getFullConfig();
    current.platforms[platform] = {
      ...(current.platforms[platform] || {}),
      ...platformConfig
    };
    fs.writeFileSync(this.configFile, JSON.stringify(current, null, 2), 'utf-8');
    this.setSecureFilePermissions(this.configFile);
  }

  public async getAllTokens(): Promise<Record<string, PlatformTokens>> {
    if (!fs.existsSync(this.tokensFile)) {
      return {};
    }
    try {
      const data = fs.readFileSync(this.tokensFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return {};
    }
  }

  public async getTokens(platform: string): Promise<PlatformTokens | undefined> {
    const all = await this.getAllTokens();
    return all[platform];
  }

  public async saveTokens(platform: string, tokens: PlatformTokens): Promise<void> {
    const current = await this.getAllTokens();
    current[platform] = tokens;
    fs.writeFileSync(this.tokensFile, JSON.stringify(current, null, 2), 'utf-8');
    this.setSecureFilePermissions(this.tokensFile);
  }
}
