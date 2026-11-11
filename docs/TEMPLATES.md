# 📝 Guia de Templates em Markdown (`.md`)

O StreamHub MCP utiliza arquivos **Markdown (`.md`)** para formatar as descrições das suas transmissões. Isso permite que você abra o arquivo no VS Code, Bloco de Notas ou Obsidian e formate seu texto com facilidade: quebras de linha, seções, emojis e links clicáveis.

---

## 📂 Onde os templates ficam salvos?

Todos os seus templates ficam na pasta:
```bash
~/.stream-hub/templates/
```

Por padrão, o arquivo principal é o `default.md`.

---

## 🛠️ Anatomia de um Template `.md`

Um template é composto por duas partes:
1. **Cabeçalho YAML (entre os marcadores `---`):** Onde ficam as configurações fixas (categorias das plataformas e tags padrão).
2. **Corpo Markdown:** O texto da descrição com variáveis dinâmicas que a IA substitui.

### Exemplo Completo (`~/.stream-hub/templates/default.md`):

```markdown
---
# Categorias padrão por plataforma
categories:
  youtube: "20" # 20 = Jogos / Gaming no YouTube
  twitch: "Hollow Knight" # Categoria padrão na Twitch se não especificar
  kick: "hollow-knight" # Categoria na Kick

# Tags automáticas incluídas em toda live
default_tags:
  - "ao vivo"
  - "gameplay"
  - "stream pt-br"
  - "games brasil"
---

{{description}}

---
### 🤝 Participantes & Convidados
{{partners}}

---
### 🔗 Minhas Redes Sociais
- 🐦 Twitter/X: https://x.com/seu_perfil
- 💬 Servidor do Discord: https://discord.gg/seu_servidor
- 🟣 Twitch: https://twitch.tv/seu_canal
- 🔴 YouTube: https://youtube.com/@seu_canal
- 🟢 Kick: https://kick.com/seu_canal

---
### ⚙️ Meu Setup
- Processador: Ryzen 7 5800X
- Placa de Vídeo: RTX 4070
- Microfone: Shure MV7
```

---

## 🧩 Variáveis Disponíveis

Você pode usar as seguintes variáveis em qualquer parte do Markdown:

| Variável | Descrição | Exemplo de Preenchimento pelo Agente |
|---|---|---|
| `{{description}}` | Resumo inteligente do tema da live gerado pelo agente ou pelo seu prompt | *"Hoje vamos explorar o novo DLC sem tomar dano!"* |
| `{{partners}}` | Linhas com @ de convidados, co-streamers ou links de parceiros | *"- Jogando com @amigo (twitch.tv/amigo)\n- Apoio: Loja Gamer"* |
| `{{title}}` | O título oficial definido para a transmissão | *"Elden Ring DLC No-Hit Run"* |
| `{{game}}` | O nome do jogo que foi detectado | *"Elden Ring"* |

*(Se você não passar parceiros em uma live, a variável `{{partners}}` é limpa automaticamente sem deixar marcas feias no texto).*

---

## 🎯 Criando Múltiplos Templates

Você pode criar quantos templates quiser! Por exemplo:
- `~/.stream-hub/templates/jogos.md` (com foco em games, tags de gameplay e setup).
- `~/.stream-hub/templates/coding.md` (com categoria "Software and Game Development", links do GitHub e stack usada).
- `~/.stream-hub/templates/podcast.md` (com foco em entrevistas e links dos convidados).

Para usar outro template no chat, basta dizer:
> *"Crie a live de hoje usando o template coding.md"*
