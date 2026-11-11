import { describe, it, expect } from 'vitest';
import { TemplateEngine } from '../../src/core/template.js';

describe('TemplateEngine', () => {
  it('parses frontmatter categories and replaces dynamic variables', () => {
    const rawMarkdown = `---
categories:
  youtube: "20"
  twitch: "Hollow Knight"
  kick: "hollow-knight"
default_tags: ["gameplay", "live", "games"]
---
{{description}}

---
### Participantes & Parceiros:
{{partners}}

---
### Redes Sociais:
- Twitch: twitch.tv/meucanal
- YouTube: youtube.com/@meucanal`;

    const parsed = TemplateEngine.parseRaw('default', rawMarkdown);
    expect(parsed.name).toBe('default');
    expect(parsed.frontmatter.categories?.['youtube']).toBe('20');
    expect(parsed.frontmatter.categories?.['twitch']).toBe('Hollow Knight');
    expect(parsed.frontmatter.default_tags).toContain('gameplay');

    const rendered = TemplateEngine.render(parsed, {
      description: 'Hoje jogando Hollow Knight do início ao fim!',
      partners: '- Apoiador: @loja_gamer'
    });

    expect(rendered.body).toContain('Hoje jogando Hollow Knight do início ao fim!');
    expect(rendered.body).toContain('- Apoiador: @loja_gamer');
    expect(rendered.body).toContain('twitch.tv/meucanal');
    // Ensure unresolved variables are cleanly handled (removed or empty)
    expect(rendered.body).not.toContain('{{');
  });

  it('handles markdown without frontmatter gracefully', () => {
    const rawMarkdown = 'Live de hoje sobre {{description}}!';
    const parsed = TemplateEngine.parseRaw('simple', rawMarkdown);
    expect(parsed.frontmatter.categories).toBeUndefined();

    const rendered = TemplateEngine.render(parsed, { description: 'Novidades Tech' });
    expect(rendered.body).toBe('Live de hoje sobre Novidades Tech!');
  });
});
