import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import type { StreamTemplate, TemplateFrontmatter } from './types.js';

export interface RenderedTemplate {
  body: string;
  frontmatter: TemplateFrontmatter;
}

export class TemplateEngine {
  public static parseRaw(name: string, content: string): StreamTemplate {
    const trimmed = content.trim();
    if (trimmed.startsWith('---')) {
      const secondIndex = trimmed.indexOf('---', 3);
      if (secondIndex !== -1) {
        const frontmatterStr = trimmed.slice(3, secondIndex).trim();
        const rawBody = trimmed.slice(secondIndex + 3).trim();
        try {
          const frontmatter = (YAML.parse(frontmatterStr) || {}) as TemplateFrontmatter;
          return { name, frontmatter, rawBody };
        } catch {
          return { name, frontmatter: {}, rawBody: trimmed };
        }
      }
    }
    return { name, frontmatter: {}, rawBody: trimmed };
  }

  public static parseFile(filePath: string): StreamTemplate {
    const name = path.basename(filePath, path.extname(filePath));
    const content = fs.readFileSync(filePath, 'utf-8');
    return this.parseRaw(name, content);
  }

  public static render(template: StreamTemplate, variables: Record<string, string>): RenderedTemplate {
    let rendered = template.rawBody;

    // Replace all {{key}} with corresponding variable or empty string if not provided
    rendered = rendered.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, key) => {
      return variables[key] !== undefined ? variables[key] : '';
    });

    return {
      body: rendered.trim(),
      frontmatter: template.frontmatter
    };
  }

  public static listTemplates(templatesDir: string): StreamTemplate[] {
    if (!fs.existsSync(templatesDir)) {
      return [];
    }
    const files = fs.readdirSync(templatesDir);
    const templates: StreamTemplate[] = [];

    for (const file of files) {
      if (file.endsWith('.md') || file.endsWith('.markdown')) {
        const fullPath = path.join(templatesDir, file);
        templates.push(this.parseFile(fullPath));
      }
    }

    return templates;
  }
}
