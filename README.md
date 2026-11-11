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

## 📦 Como Instalar

Você pode instalar o StreamHub de duas formas:

### Opção 1: Instalação via Plugin (Recomendada para Antigravity / AGY)

No seu terminal ou chat com o agente:
```bash
# Instalação automática do plugin
agy plugin install cristianodmtsb/stream-hub-mcp
```
*(Ou simplesmente clone na pasta global de plugins: `git clone git@github.com:cristianodmtsb/stream-hub-mcp.git ~/.gemini/config/plugins/stream-hub`)*

Ao fazer isso:
- O Antigravity descobre o plugin automaticamente em `~/.gemini/config/plugins/stream-hub/`.
- O servidor MCP e a skill do agente são ativados imediatamente.

---

### Opção 2: Instalação Manual (Para Claude Desktop, Cursor ou Desenvolvimento)

```bash
# 1. Clone o repositório onde preferir
git clone git@github.com:cristianodmtsb/stream-hub-mcp.git
cd stream-hub-mcp

# 2. Instale as dependências e compile o TypeScript
npm install
npm run build
```

---

## 📂 Onde ficam salvos os arquivos e como editar?

Para garantir segurança e para que você **nunca perca suas configurações ao atualizar o plugin**, os arquivos são separados em dois lugares:

| Tipo de Arquivo | Onde fica salvo? | Para que serve? |
|---|---|---|
| **Credenciais e Senhas** | `~/.stream-hub/config.json` e `tokens.json` | 100% privado na sua máquina, protegido contra sobrescritas. |
| **Seus Templates Pessoais** | `~/.stream-hub/templates/default.md` | Onde você edita suas redes, regras e links com seu editor preferido. |
| **Código-Fonte do Plugin** | `~/.gemini/config/plugins/stream-hub/` | Onde o código compilado do MCP e os templates padrão residem. |

> 💡 **Como editar seus templates:**  
> Basta abrir o arquivo `~/.stream-hub/templates/default.md` no VS Code ou Bloco de Notas. Ele sempre terá prioridade sobre os templates padrão do repositório!


---

## ⚡ Autenticação Direta pelo Chat (Zero Terminal)

Se você instalou como plugin ou MCP, não precisa abrir o terminal ou arquivos JSON para autorizar suas contas:
Basta dizer no chat:
- 💬 **Twitch:** *"Conectar Twitch"* ou `/auth-twitch` (abre o navegador para autorizar).
- 💬 **YouTube:** *"Conectar YouTube"* ou `/auth-youtube` (abre o navegador para autorizar).
- 💬 **Kick:** *"Conectar Kick"* ou `/auth-kick` (basta informar seu canal e API key direto no chat e o agente salva para você).

O agente chamará a ferramenta de autenticação, abrirá o navegador ou salvará as chaves automaticamente na sua máquina (`~/.stream-hub/config.json`).

*(O comando de terminal `node dist/bin/cli.js auth <platform>` continua disponível como alternativa caso prefira).*

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

## 💬 Comandos Rápidos no Chat (Zero Terminal)

Você pode gerenciar tudo diretamente na conversa com o agente:

| Comando | O que faz |
|---|---|
| `/auth-youtube` | Inicia a autorização com o YouTube Live pelo navegador |
| `/auth-twitch` | Inicia a autorização com a Twitch Helix pelo navegador |
| `/auth-kick` | Configura seu canal e API Key da Kick diretamente no chat |
| `Status` ou `Verificar plataformas` | Exibe quais plataformas estão ativas e autenticadas |

---

## 🧪 (Opcional) Comandos de Terminal / CLI

Caso prefira rodar comandos diretamente no terminal:

```bash
# Verificar status das plataformas conectadas
node dist/bin/cli.js status

# Autenticar plataformas via terminal
node dist/bin/cli.js auth youtube
node dist/bin/cli.js auth twitch
node dist/bin/cli.js auth kick
```

---

## 📄 Licença
Distribuído sob a licença [MIT](LICENSE). Contribuições da comunidade são muito bem-vindas!
