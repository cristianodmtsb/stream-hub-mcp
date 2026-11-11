import { describe, it, expect, vi } from 'vitest';
import { TwitchAdapter } from '../../src/adapters/twitch/twitch.adapter.js';

describe('TwitchAdapter', () => {
  it('truncates titles longer than 140 characters cleanly', () => {
    const adapter = new TwitchAdapter({} as any);
    const longTitle = 'Super incrível live de testes com título gigantesco que ultrapassa com certeza o limite de cento e quarenta caracteres estabelecido oficialmente pela Twitch Helix API para canais';
    const sanitized = adapter.sanitizeTitle(longTitle);
    expect(sanitized.length).toBeLessThanOrEqual(140);
  });

  it('formats tags removing invalid characters', () => {
    const adapter = new TwitchAdapter({} as any);
    const rawTags = ['Game Play!', '#coding', 'super-tag_123', 'a'.repeat(30)];
    const sanitized = adapter.sanitizeTags(rawTags);
    expect(sanitized).toBeInstanceOf(Array);
    for (const tag of sanitized) {
      expect(tag.length).toBeLessThanOrEqual(25);
    }
  });
});
