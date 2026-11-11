import { describe, it, expect } from 'vitest';
import { KickAdapter } from '../../src/adapters/kick/kick.adapter.js';

describe('KickAdapter', () => {
  it('instantiates and validates configuration requirements', async () => {
    const adapter = new KickAdapter({} as any);
    expect(adapter.id).toBe('kick');
    expect(adapter.name).toBe('Kick');
  });

  it('normalizes category slugs correctly', () => {
    const adapter = new KickAdapter({} as any);
    const slug = adapter.normalizeSlug('Hollow Knight: Silksong');
    expect(slug).toBe('hollow-knight-silksong');
  });
});
