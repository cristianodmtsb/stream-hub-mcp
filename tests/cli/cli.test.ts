import { describe, it, expect } from 'vitest';
import { buildDefaultTemplateContent } from '../../src/cli/setup.js';

describe('CLI Setup', () => {
  it('generates a valid default markdown template with frontmatter and variables', () => {
    const template = buildDefaultTemplateContent();
    expect(template).toContain('categories:');
    expect(template).toContain('youtube: "20"');
    expect(template).toContain('{{description}}');
    expect(template).toContain('{{partners}}');
  });
});
