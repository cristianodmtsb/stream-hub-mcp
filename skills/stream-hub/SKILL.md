---
name: stream-hub
description: Use when the user wants to configure, schedule or prepare a live stream on YouTube, Twitch or Kick, or when they attach a stream thumbnail.
---

# StreamHub Skill

This skill guides the agent in using the `stream-hub` MCP tools to configure multi-platform live streaming with minimal friction.

## When to Activate
Activate this skill whenever the user:
- Mentions going live, starting a stream, or scheduling a broadcast on YouTube, Twitch, or Kick.
- Shares a stream thumbnail image and provides a topic, co-streamers, or game name.
- Asks to preview or update stream descriptions and titles.

## Workflow

### 1. Context & Game Detection
- **Inspect the thumbnail image** (if provided): extract visual clues, character/game art, and prominent text.
- **Identify the Game or Topic:** extract the canonical game name (e.g., "Hollow Knight", "Elden Ring") or category ("Software and Game Development").
- **Identify Collaborators:** extract any @ mentions or links for co-hosts/partners.

### 2. Preview Before Publishing
Always invoke the `preview_live_metadata` tool first:
- Pass the stream `title`, generated `description`, detected `game`, `partners`, and `thumbnailPath`.
- Present a clean markdown preview to the user:
  - **Título:** Final stream title (respecting Twitch 140 chars).
  - **Jogo / Categorias:** Twitch & Kick directory name, YouTube category.
  - **Tags SEO:** High-engagement tags generated for YouTube.
  - **Descrição:** Formatted text with template, links, and partner mentions.
- Ask the user: *"Deseja fazer algum ajuste ou posso configurar as transmissões?"*

### 3. Dispatch Live Setup
Once the user confirms (or if they explicitly asked to do it immediately):
- Call `prepare_live` with `platforms: ["all"]` (or specific platforms requested), passing `title`, `description`, `game`, `partners`, and `thumbnailPath`.
- Report the results:
  - Display the generated YouTube Live URL (`https://youtube.com/live/...`).
  - Confirm that Twitch and Kick channel titles and categories were successfully updated.
  - Remind the user that they can now click "Iniciar Transmissão" in OBS Studio.
