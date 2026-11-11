# 🖼️ Guia de Uso de Thumbnails

O **StreamHub MCP** suporta o envio e o upload automático de miniaturas (thumbnails) diretamente na criação da sua live.

---

## 🚀 Como usar no dia a dia

1. **Arraste e solte a imagem da thumbnail** na conversa do chat com o agente (no Antigravity, Claude ou Cursor).
2. Escreva o tema rápido:
   > *"Vou fazer live hoje desse jogo com @amigo. Cria a transmissão para mim."*
3. O agente:
   - "Vê" a imagem com sua visão multimodal.
   - Identifica o nome do jogo, o estilo e o clima da transmissão.
   - Pede confirmação da descrição e título.
   - Chama a ferramenta `prepare_live` passando o caminho da imagem.
   - O adaptador do YouTube faz o upload binário via API oficial (`thumbnails.set`) associando a arte à transmissão.

---

## 📐 Boas Práticas e Especificações Recomendadas

Para garantir que sua miniatura seja aceita pelo YouTube e fique perfeita nos feeds:

| Característica | Recomendação Oficial do YouTube |
|---|---|
| **Resolução** | 1280 x 720 pixels (mínimo) ou **1920 x 1080 pixels** (Full HD recomendado) |
| **Proporção** | **16:9** (widescreen) |
| **Formatos suportados** | `.jpg`, `.jpeg`, `.png` |
| **Tamanho máximo de arquivo** | **2 MB** (limite da API do YouTube para thumbnails) |

---

## 💡 Dicas de Sucesso
- Evite imagens muito pesadas (> 2MB). Se estiver muito grande, salve em JPEG com qualidade 85% para reduzir o peso sem perder nitidez.
- No OBS, lembre-se de que a thumbnail fica visível para quem procura a live no YouTube antes de clicar e nas notificações da Twitch/Kick.
