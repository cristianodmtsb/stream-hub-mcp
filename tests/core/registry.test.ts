import { describe, it, expect } from 'vitest';
import { AdapterRegistry } from '../../src/core/registry.js';
import { BasePlatformAdapter } from '../../src/adapters/base.adapter.js';
import type { LiveDetails, LiveResult } from '../../src/core/types.js';

class MockPlatformAdapter extends BasePlatformAdapter {
  readonly id = 'mock';
  readonly name = 'Mock Platform';

  async isConfigured(): Promise<boolean> {
    return true;
  }

  async authenticate(): Promise<void> {}

  async createOrScheduleLive(details: LiveDetails): Promise<LiveResult> {
    return { platform: this.id, success: true, liveUrl: 'https://mock.com/live/123' };
  }

  async updateLive(details: Partial<LiveDetails>): Promise<LiveResult> {
    return { platform: this.id, success: true };
  }
}

describe('AdapterRegistry', () => {
  it('registers and retrieves adapters', () => {
    const registry = new AdapterRegistry();
    const mock = new MockPlatformAdapter({} as any);
    registry.register(mock);

    expect(registry.get('mock')).toBe(mock);
    expect(registry.getAll()).toHaveLength(1);
    expect(registry.getAll()[0].name).toBe('Mock Platform');
  });

  it('dispatches to multiple adapters and returns aggregated results', async () => {
    const registry = new AdapterRegistry();
    registry.register(new MockPlatformAdapter({} as any));

    const result = await registry.dispatchPrepareLive(['mock'], {
      title: 'Test Live',
      description: 'Testing live multi-platform'
    });

    expect(result.overallSuccess).toBe(true);
    expect(result.results['mock'].success).toBe(true);
    expect(result.results['mock'].liveUrl).toBe('https://mock.com/live/123');
  });
});
