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
Abra ou crie o arquivo `~/.stream-hub/config.json` e adicione:
```json
{
  "platforms": {
    "twitch": {
      "clientId": "SEU_CLIENT_ID_DA_TWITCH",
      "clientSecret": "SEU_CLIENT_SECRET_DA_TWITCH",
      "channelName": "seu_nome_de_usuario_na_twitch",
      "channelId": "SEU_BROADCASTER_ID"
    }
  }
}
```
*(Dica: Se não souber seu `channelId` numérico, ferramentas como [twitchid.com](https://twitchid.com) convertem seu nome de usuário no ID numérico).*

### Passo 3: Autorizar
No terminal, execute:
```bash
node dist/bin/cli.js auth twitch
# (ou se instalado via plugin: node ~/.gemini/config/plugins/stream-hub/dist/bin/cli.js auth twitch)
```
Seu navegador abrirá para você conceder permissão ao seu canal. O StreamHub receberá o token e salvará automaticamente em `~/.stream-hub/tokens.json`.

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
E no terminal execute:
```bash
node dist/bin/cli.js auth youtube
# (ou se instalado via plugin: node ~/.gemini/config/plugins/stream-hub/dist/bin/cli.js auth youtube)
```

---

## 3. 🟢 Kick

A Kick utiliza a API de canais para atualizar metadados:

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

## 4. Testando o Status

Para checar se suas plataformas estão prontas:
```bash
node dist/bin/cli.js status
```
Você verá:
```
- YOUTUBE : 🟢 Autenticado
- TWITCH  : 🟢 Autenticado
- KICK    : 🟢 Autenticado
```
