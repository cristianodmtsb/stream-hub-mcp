# 🔑 Guia de Autenticação e Credenciais (YouTube, Twitch, Kick)

Todas as credenciais e tokens ficam salvos **apenas no seu computador** em `~/.stream-hub/config.json` e `~/.stream-hub/tokens.json`. Ninguém além de você tem acesso.

---

## 💡 Como executar os comandos do CLI

O StreamHub oferece comandos para autorizar suas contas (`auth`) e checar o status (`status`). Você pode executá-los de acordo com a forma que instalou:

- **Se você instalou como Plugin no Antigravity:**  
  ```bash
  node ~/.gemini/config/plugins/stream-hub/dist/bin/cli.js <comando>
  ```
- **Se você clonou o repositório em uma pasta local:**  
  ```bash
  cd caminho/para/stream-hub-mcp
  node dist/bin/cli.js <comando>
  ```

---

## 1. 🟣 Twitch (Helix API)

Para atualizar o título, categoria/jogo e tags da sua live na Twitch:

### Passo 1: Criar o App na Twitch
1. Acesse o [Twitch Developer Console](https://dev.twitch.tv/console/apps).
2. Clique em **Register Your Application** (Cadastrar seu aplicativo).
3. Preencha:
   - **Name:** `StreamHub - Meu Canal` (ou qualquer nome).
   - **OAuth Redirect URLs:** `http://localhost:8080/callback` *(obrigatório colocar exatamente esse endereço)*.
   - **Category:** `Application Integration` ou `Broadcast Tools`.
4. Clique em **Create**.
5. Na tela do app, copie o **Client ID** e clique em **New Secret** para copiar o **Client Secret**.

### Passo 2: Salvar no seu `~/.stream-hub/config.json`
Você só precisa colar o `clientId` e o `clientSecret`:
```json
{
  "platforms": {
    "twitch": {
      "clientId": "SEU_CLIENT_ID_DA_TWITCH",
      "clientSecret": "SEU_CLIENT_SECRET_DA_TWITCH"
    }
  }
}
```
> ✨ **Detecção Automática:** O seu `channelName` e `channelId` numérico são **detectados e preenchidos 100% sozinhos** pela API da Twitch assim que você fizer o login. Você não precisa caçar nem preencher nenhum ID!

### Passo 3: Autorizar
Você pode autorizar de duas formas:
- **No Chat do Agente:** Digite `/auth-twitch` (o navegador abre para você clicar em Permitir).
- **No Terminal:**
  ```bash
  node dist/bin/cli.js auth twitch
  ```
Ao autorizar, o StreamHub obtém os dados do seu canal automaticamente e salva os tokens com segurança em `~/.stream-hub/tokens.json`.

---

## 2. 🔴 YouTube Live (Google Cloud)

Para criar transmissões ao vivo, fazer upload da thumbnail e configurar tags no YouTube:

### Passo 1: Criar o Projeto no Google Cloud
1. Acesse o [Google Cloud Console](https://console.cloud.google.com).
2. Crie um novo projeto (ex: `StreamHub Live`).
3. Vá em **APIs e Serviços > Biblioteca**.
4. Pesquise por **YouTube Data API v3** e clique em **Ativar**.

### Passo 2: Configurar a Tela de Consentimento OAuth
1. Vá em **APIs e Serviços > Tela de permissão OAuth**.
2. Selecione **Externo** e clique em Criar.
3. Preencha seu e-mail e nome do app.
4. Na aba **Usuários de teste**, adicione o **seu e-mail do Google/YouTube** (já que o app estará em modo de teste pessoal).

### Passo 3: Criar as Credenciais
1. Vá em **APIs e Serviços > Credenciais > Criar Credenciais > ID do cliente OAuth**.
2. Tipo de aplicativo: **Aplicativo da Web** ou **Aplicativo para Computador (Desktop)**.
3. Se escolher Web, adicione em **URIs de redirecionamento autorizados**:
   `http://localhost:8080/callback`
4. Copie o **ID do cliente** e a **Chave secreta do cliente**.

### Passo 4: Salvar e Autorizar
Adicione ao seu `~/.stream-hub/config.json`:
```json
{
  "platforms": {
    "youtube": {
      "clientId": "SEU_CLIENT_ID_DO_GOOGLE.apps.googleusercontent.com",
      "clientSecret": "SEU_CLIENT_SECRET_DO_GOOGLE"
    }
  }
}
```
> ✨ **Detecção Automática:** O ID e nome do seu canal do YouTube são detectados e associados automaticamente no momento em que você autoriza!

E autorize:
- **No Chat do Agente:** Digite `/auth-youtube` (o navegador abre para você permitir).
- **No Terminal:**
  ```bash
  node dist/bin/cli.js auth youtube
  ```

---

## 3. 🟢 Kick

A Kick utiliza a API de canais para atualizar título e categoria da transmissão:

### Método 1: Direto pelo Chat (Sem abrir arquivos)
Basta dizer no chat:
> *"Conectar Kick canal meu_usuario chave_api_aqui"* ou `/auth-kick`
O agente chamará a ferramenta e salvará de forma segura no seu `~/.stream-hub/config.json`.

---

### Método 2: Manual via JSON
1. Abra seu `~/.stream-hub/config.json`.
2. Adicione os dados do seu canal:
```json
{
  "platforms": {
    "kick": {
      "channelSlug": "seu_canal_na_kick",
      "apiKey": "SEU_TOKEN_DE_CANAL_KICK"
    }
  }
}
```

---

## 4. Testando o Status das Plataformas

Para verificar se suas contas estão conectadas:

### Opção 1: No Chat do Agente (Recomendado)
Digite no chat:
> `/stream-status` (ou pergunte *"quais plataformas estão conectadas?"*)

O agente exibirá uma lista com o status de cada serviço:
```markdown
- 🔴 YOUTUBE : 🟢 Conectado
- 🟣 TWITCH  : 🟢 Conectado
- 🟢 KICK    : 🟢 Conectado
```

### Opção 2: No Terminal
Execute:
```bash
node dist/bin/cli.js status
```
