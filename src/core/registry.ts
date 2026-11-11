import type { PlatformAdapter, LiveDetails, MultiPlatformResult, LiveResult } from './types.js';

export class AdapterRegistry {
  private adapters: Map<string, PlatformAdapter> = new Map();

  public register(adapter: PlatformAdapter): void {
    this.adapters.set(adapter.id.toLowerCase(), adapter);
  }

  public get(id: string): PlatformAdapter | undefined {
    return this.adapters.get(id.toLowerCase());
  }

  public getAll(): PlatformAdapter[] {
    return Array.from(this.adapters.values());
  }

  public async getAvailablePlatformIds(): Promise<string[]> {
    const available: string[] = [];
    for (const [id, adapter] of this.adapters.entries()) {
      if (await adapter.isConfigured()) {
        available.push(id);
      }
    }
    return available;
  }

  public async dispatchPrepareLive(
    targetPlatforms: string[],
    details: LiveDetails
  ): Promise<MultiPlatformResult> {
    const isAll = targetPlatforms.length === 0 || targetPlatforms.includes('all');
    const platformsToTarget = isAll ? Array.from(this.adapters.keys()) : targetPlatforms.map(p => p.toLowerCase());

    const results: Record<string, LiveResult> = {};
    let overallSuccess = true;

    // Dispatch concurrently across platforms
    const dispatchPromises = platformsToTarget.map(async (platformId) => {
      const adapter = this.adapters.get(platformId);
      if (!adapter) {
        return {
          platformId,
          result: {
            platform: platformId,
            success: false,
            error: `Adapter for platform '${platformId}' not registered.`
          }
        };
      }

      try {
        const isConfigured = await adapter.isConfigured();
        if (!isConfigured) {
          return {
            platformId,
            result: {
              platform: platformId,
              success: false,
              error: `Platform '${platformId}' is not configured or authenticated.`
            }
          };
        }

        const res = await adapter.createOrScheduleLive(details);
        return {
          platformId,
          result: res
        };
      } catch (err: any) {
        return {
          platformId,
          result: {
            platform: platformId,
            success: false,
            error: err.message || String(err)
          }
        };
      }
    });

    const settled = await Promise.allSettled(dispatchPromises);
    for (const outcome of settled) {
      if (outcome.status === 'fulfilled') {
        const { platformId, result } = outcome.value;
        results[platformId] = result;
        if (!result.success) {
          overallSuccess = false;
        }
      }
    }

    return { overallSuccess, results };
  }
}
