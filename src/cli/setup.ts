import fs from 'node:fs';
import path from 'node:path';
import { ConfigManager } from '../core/config.js';

export function buildDefaultTemplateContent(): string {
  return `---
# Categorias padrão por plataforma
categories:
  youtube: "20" # 20 = Gaming / Jogos
  twitch: "Software and Game Development"
  kick: "software-development"

# Tags automáticas inseridas em todas as transmissões
default_tags:
  - "ao vivo"
  - "gameplay"
  - "games"
  - "portugues"
---

{{description}}

---
### 🤝 Participantes & Parceiros
{{partners}}

---
### 🔗 Minhas Redes Sociais
- 🐦 Twitter/X: https://x.com/seu_usuario
- 💬 Discord: https://discord.gg/seu_canal
- 💻 YouTube: https://youtube.com/@seu_canal
- 🟣 Twitch: https://twitch.tv/seu_canal
- 🟢 Kick: https://kick.com/seu_canal
`;
}

export async function runSetupWizard(customBaseDir?: string): Promise<void> {
  const configManager = new ConfigManager(customBaseDir);
  const baseDir = configManager.getBaseDir();
  const templatesDir = path.join(baseDir, 'templates');

  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }

  const defaultTemplateFile = path.join(templatesDir, 'default.md');
  if (!fs.existsSync(defaultTemplateFile)) {
    fs.writeFileSync(defaultTemplateFile, buildDefaultTemplateContent(), 'utf-8');
    console.log(`✅ Template padrão criado em: ${defaultTemplateFile}`);
  }

  console.log(`\n🎉 StreamHub MCP configurado com sucesso em: ${baseDir}`);
  console.log('\nPróximos passos:');
  console.log('1. Autentique o YouTube: npx stream-hub auth youtube');
  console.log('2. Autentique a Twitch:  npx stream-hub auth twitch');
  console.log('3. Autentique a Kick:    npx stream-hub auth kick');
}
