import { describe, it, expect } from 'vitest';
import type { LiveDetails, LiveResult, MultiPlatformResult, PlatformTokens } from '../../src/core/types.js';

describe('Core Types', () => {
  it('validates shape of LiveDetails and LiveResult', () => {
    const details: LiveDetails = {
      title: 'Testing Stream',
      description: 'Stream description',
      category: 'Software and Game Development',
      game: 'Hollow Knight',
      tags: ['coding', 'typescript'],
      thumbnailPath: '/path/to/thumb.jpg'
    };
    expect(details.title).toBe('Testing Stream');
    expect(details.game).toBe('Hollow Knight');

    const result: LiveResult = {
      platform: 'youtube',
      success: true,
      liveUrl: 'https://youtube.com/live/xyz'
    };
    expect(result.success).toBe(true);

    const multiResult: MultiPlatformResult = {
      overallSuccess: true,
      results: {
        youtube: result
      }
    };
    expect(multiResult.results['youtube'].liveUrl).toBe('https://youtube.com/live/xyz');
  });

  it('validates shape of PlatformTokens', () => {
    const tokens: PlatformTokens = {
      accessToken: 'test-token',
      refreshToken: 'test-refresh',
      expiresAt: Date.now() + 3600000
    };
    expect(tokens.accessToken).toBe('test-token');
  });
});
