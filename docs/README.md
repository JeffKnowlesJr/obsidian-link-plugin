# Obsidian Link Plugin

A focused Obsidian plugin for automatic daily note organization with monthly folders and seamless Daily Notes integration.

## Features

- **Automatic Monthly Folders:** Daily notes are organized into year/month folders (e.g., `2025/07-July/`).
- **Daily Notes Integration:** Optionally syncs with Obsidian's Daily Notes plugin.
- **Custom Template Location:** Set your own template path for daily notes.

## Installation

1. Open Obsidian Settings → Community Plugins
2. Search for "Link Plugin" and install
3. Enable the plugin

## Quick Start

- Click the ribbon button to create or open today's note.
- Configure folder and template options in the plugin settings.

## Example Daily Note Template (YAML frontmatter)

```markdown
---
date: { { date } }
title: { { title } }
---

# {{title}}
```

---

For more, see the in-app settings or [DAILY_NOTES_INTEGRATION.md](./DAILY_NOTES_INTEGRATION.md).
