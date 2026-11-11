# 🚀 StreamHub MCP

**StreamHub MCP** é um servidor MCP (*Model Context Protocol*) de código aberto que permite a qualquer agente de inteligência artificial (como **Google Antigravity**, **Claude Desktop**, **Cursor** ou **ChatGPT**) configurar e disparar lives simultâneas no **YouTube Live**, **Twitch** e **Kick**.

Basta jogar a thumbnail no chat e dizer o tema da transmissão (ex: *"Vou jogar Hollow Knight com @fulano e link de parceiro X"*). O agente:
1. 🖼️ **Analisa a imagem e o tema.**
2. 🎮 **Detecta o jogo oficial na Twitch e na Kick** para garantir que você apareça na categoria correta.
3. 🏷️ **Gera tags de SEO otimizadas para o YouTube** (respeitando o limite de 500 caracteres).
4. 📄 **Monta a descrição usando seus templates em Markdown (`.md`)**, incluindo suas redes sociais e apoiadores.
5. ⚡ **Configura as 3 plataformas de uma vez** para você só clicar em "Iniciar Transmissão" no OBS.

---

## 🔒 100% Seguro e Local (Privacidade Total)
- **Zero servidores centrais ou bancos de dados na nuvem:** o código roda inteiramente no seu computador.
- **Suas credenciais e tokens ficam salvos exclusivamente na sua máquina** em `~/.stream-hub/` com permissão restrita de acesso (`chmod 600`).
- Total conformidade com LGPD / GDPR.

---

## 📦 Instalação Rápida

```bash
# Clone o repositório
git clone git@github.com:cristianodmtsb/stream-hub-mcp.git
cd stream-hub-mcp

# Instale as dependências e compile
npm install
npm run build
```

---

## ⚡ Configuração Inicial (Assistente)

Execute o assistente inicial para criar os diretórios e o template padrão:

```bash
node dist/bin/cli.js setup
```

Isso criará a pasta `~/.stream-hub/` e o seu primeiro template em `~/.stream-hub/templates/default.md`.

---

## 📖 Guias Detalhados

- 🔑 [**Guia de Autenticação e Credenciais (YouTube, Twitch, Kick)**](docs/SETUP.md): Passo a passo simples com links para obter suas chaves de API sem dor de cabeça.
- 📝 [**Guia de Templates em Markdown (`.md`)**](docs/TEMPLATES.md): Como editar sua descrição padrão, adicionar redes sociais e patrocinadores.
- 🖼️ [**Guia de Thumbnails**](docs/THUMBNAILS.md): Como enviar imagens no chat e recomendações para YouTube/Twitch.
- 🛠️ [**Como Contribuir com Novas Plataformas**](docs/CONTRIBUTING.md): Como adicionar adaptadores para TikTok, Instagram, Bilibili, etc.

---

## 🤖 Como Conectar ao Antigravity / Claude Desktop

Adicione ao seu arquivo de configuração de MCP (ex: `mcpSettings.json` ou `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "stream-hub": {
      "command": "node",
      "args": ["/caminho/absoluto/para/stream-hub-mcp/dist/index.js"]
    }
  }
}
```

---

## 🧪 Comandos Úteis do CLI

```bash
# Verificar status das plataformas conectadas
node dist/bin/cli.js status

# Iniciar autenticação OAuth de uma plataforma
node dist/bin/cli.js auth twitch
node dist/bin/cli.js auth youtube
```

---

## 📄 Licença
Distribuído sob a licença [MIT](LICENSE). Contribuições da comunidade são muito bem-vindas!
