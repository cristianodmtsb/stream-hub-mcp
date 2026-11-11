import { describe, it, expect } from 'vitest';
import { YouTubeAdapter } from '../../src/adapters/youtube/youtube.adapter.js';

describe('YouTubeAdapter', () => {
  it('formats SEO tags without exceeding 500 characters', () => {
    const adapter = new YouTubeAdapter({} as any);
    const tags = [
      'Hollow Knight',
      'Gameplay PT-BR',
      'Live de Jogos',
      'Elden Ring',
      'Long tag that goes on and on to fill up some space in the tag list',
      'a'.repeat(200),
      'b'.repeat(200),
      'c'.repeat(200)
    ];

    const formatted = adapter.formatTags(tags);
    const totalChars = formatted.join(',').length;
    expect(totalChars).toBeLessThanOrEqual(500);
    expect(formatted.length).toBeGreaterThan(0);
  });

  it('validates thumbnail existence before upload', async () => {
    const adapter = new YouTubeAdapter({} as any);
    const isValid = adapter.validateThumbnailPath('/path/to/non_existent_thumb_12345.jpg');
    expect(isValid).toBe(false);
  });
});
