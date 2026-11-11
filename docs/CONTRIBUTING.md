# 🛠️ Guia de Contribuição: Adicionando Novas Plataformas

O StreamHub MCP foi projetado com o **Padrão de Adaptadores (Plugin/Adapter Pattern)**. Adicionar suporte a uma nova plataforma (como TikTok Live, Facebook Gaming, Bilibili, LinkedIn ou X) é simples e não exige alterar o código central.

---

## 🏗️ O Contrato de um Adaptador (`PlatformAdapter`)

Cada plataforma vive em sua própria pasta dentro de `src/adapters/<nome_da_plataforma>/` e implementa a classe base `BasePlatformAdapter`:

```typescript
import { BasePlatformAdapter } from '../base.adapter.js';
import type { LiveDetails, LiveResult } from '../../core/types.js';

export class NovaPlataformaAdapter extends BasePlatformAdapter {
  readonly id = 'novaplataforma';
  readonly name = 'Nome da Plataforma';

  // Verifica se o usuário tem credenciais salvas no ~/.stream-hub/config.json
  async isConfigured(): Promise<boolean> {
    const config = await this.getPlatformConfig();
    return Boolean(config?.apiKey);
  }

  // Fluxo de autenticação
  async authenticate(): Promise<void> {
    // Implementar se necessário
  }

  // Atualização ou criação da live
  async updateLive(details: Partial<LiveDetails>): Promise<LiveResult> {
    // Fazer a chamada HTTP para a API da plataforma
    return {
      platform: this.id,
      success: true,
      liveUrl: 'https://novaplataforma.com/meucanal'
    };
  }

  async createOrScheduleLive(details: LiveDetails): Promise<LiveResult> {
    return this.updateLive(details);
  }
}
```

---

## 🧪 Testes Automatizados

Cada novo adaptador deve vir acompanhado de seus testes unitários em `tests/adapters/<nome_da_plataforma>.test.ts`:

```bash
# Rodar todos os testes
npm test

# Rodar apenas o teste do seu adaptador
npx vitest run tests/adapters/novaplataforma.test.ts
```

---

## 📬 Como Enviar seu Pull Request

1. Faça um Fork do repositório no GitHub: `git@github.com:cristianodmtsb/stream-hub-mcp.git`
2. Crie sua branch: `git checkout -b feat/adapter-novaplataforma`
3. Adicione o adaptador e os testes unitários.
4. Registre o adaptador em `src/mcp/tools.ts` para ser ativado por padrão.
5. Verifique a compilação: `npm run build && npm test`.
6. Abra o Pull Request! 🚀
