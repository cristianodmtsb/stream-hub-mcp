import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConfigManager } from '../../src/core/config.js';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

describe('ConfigManager', () => {
  const testDir = path.join(os.tmpdir(), `stream-hub-test-${Date.now()}`);

  beforeEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('initializes base directory and stores configuration safely', async () => {
    const manager = new ConfigManager(testDir);
    expect(fs.existsSync(testDir)).toBe(true);

    await manager.savePlatformConfig('youtube', { clientId: 'yt-client-id', clientSecret: 'yt-secret' });
    const config = await manager.getPlatformConfig('youtube');
    expect(config?.clientId).toBe('yt-client-id');
    expect(config?.clientSecret).toBe('yt-secret');
  });

  it('stores and retrieves tokens with restricted permissions', async () => {
    const manager = new ConfigManager(testDir);
    await manager.saveTokens('twitch', {
      accessToken: 'access-123',
      refreshToken: 'refresh-456',
      expiresAt: Date.now() + 3600000
    });

    const tokens = await manager.getTokens('twitch');
    expect(tokens?.accessToken).toBe('access-123');
    expect(tokens?.refreshToken).toBe('refresh-456');

    const tokensFile = path.join(testDir, 'tokens.json');
    expect(fs.existsSync(tokensFile)).toBe(true);

    if (process.platform !== 'win32') {
      const stats = fs.statSync(tokensFile);
      // Check that other users have no access (mode & 0o077 === 0)
      expect(stats.mode & 0o077).toBe(0);
    }
  });
});
