import { describe, it, expect, beforeEach } from 'vitest';
import { StreamOrchestrator } from '../../src/mcp/tools.js';
import { ConfigManager } from '../../src/core/config.js';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';

describe('StreamOrchestrator', () => {
  const testDir = path.join(os.tmpdir(), `stream-hub-orch-${Date.now()}`);

  beforeEach(() => {
    fs.mkdirSync(path.join(testDir, 'templates'), { recursive: true });
    fs.writeFileSync(
      path.join(testDir, 'templates', 'default.md'),
      `---
categories:
  youtube: "20"
  twitch: "Elden Ring"
default_tags: ["games", "rpg"]
---
{{description}}

Parceiros:
{{partners}}`
    );
  });

  it('previews formatted live metadata using markdown template', async () => {
    const configManager = new ConfigManager(testDir);
    const orchestrator = new StreamOrchestrator(configManager);

    const preview = await orchestrator.previewLiveMetadata({
      title: 'Elden Ring DLC No-Hit Run',
      description: 'Tentando zerar sem tomar dano!',
      partners: '- Sponsor: @GamerShop',
      game: 'Elden Ring',
      templateName: 'default'
    });

    expect(preview.title).toBe('Elden Ring DLC No-Hit Run');
    expect(preview.renderedDescription).toContain('Tentando zerar sem tomar dano!');
    expect(preview.renderedDescription).toContain('- Sponsor: @GamerShop');
    expect(preview.categories['youtube']).toBe('20');
    expect(preview.categories['twitch']).toBe('Elden Ring');
    expect(preview.tags).toContain('games');
  });

  it('lists registered platforms and status', async () => {
    const configManager = new ConfigManager(testDir);
    const orchestrator = new StreamOrchestrator(configManager);

    const platforms = await orchestrator.listPlatforms();
    expect(platforms.length).toBeGreaterThanOrEqual(3);
    const ids = platforms.map(p => p.id);
    expect(ids).toContain('youtube');
    expect(ids).toContain('twitch');
    expect(ids).toContain('kick');
  });
});
