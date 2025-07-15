# DateFolders for DailyNotes v1.0.0

A minimal Obsidian plugin for **automatic date-based folder organization** with year/month folder structure and seamless Daily Notes integration.

## Core Features

### Date-Based Folder Structure
- **Automatic Year/Month Folders**: Creates organized folder structure (e.g., `2025/July/`)
- **Configurable Formats**: Set custom year, month, and daily note formats
- **Future Note Creation**: Create daily notes for future dates

### Daily Notes Integration
- **Optional Integration**: Works with Obsidian's Daily Notes plugin
- **Settings Backup**: Safely backs up and restores Daily Notes settings


## Folder Structure

The plugin creates this organized structure:

```
DateFolders/
├── 2025/
│   ├── July/
│   │   ├── 2025-07-01 Tuesday.md
│   │   ├── 2025-07-02 Wednesday.md
│   │   └── ...
│   ├── August/
│   │   └── ...
│   └── ...
└── [other daily notes]
```

**Benefits:**
- **Automatic Organization**: Notes are placed in correct year/month folders
- **Configurable Base Folder**: Set your preferred daily notes folder location
- **Consistent Structure**: Reliable folder creation and note placement

## 🛠️ Installation

1. Open Obsidian Settings → Community Plugins
2. Disable Safe Mode if enabled
3. Browse and search for "Link Plugin"
4. Install and enable the plugin

## Quick Start

1. **Install and Enable**: Install from Community Plugins and enable
2. **Create Today's Note**: Use the command palette or ribbon button
3. **Configure Settings**: Set your preferred folder and date formats

### Key Settings
- **Base Folder**: Where daily notes are stored (default: "DateFolders")
- **Year Format**: `YYYY` creates "2025"
- **Month Format**: `MMMM` creates "July" 
- **Daily Note Format**: `YYYY-MM-DD dddd` creates "2025-07-01 Tuesday"


## Configuration

Access settings via Community Plugins → DateFolders for DailyNotes:

### Journal Settings
- **Base Folder**: Set the root folder for journal notes
- **Year Folder Format**: Configure year folder naming (default: `YYYY`)
- **Month Folder Format**: Configure month folder naming (default: `MMMM`) 
- **Daily Note Format**: Customize daily note naming (default: `YYYY-MM-DD dddd`)

### Daily Notes Integration
- **Enable Integration**: Toggle integration with Obsidian's Daily Notes plugin
- **Backup & Restore**: Automatic backup with one-click restore option

## License

MIT License - See [LICENSE](LICENSE) for details.

---

_The DateFolders for DailyNotes plugin provides essential date-based folder organization with automatic year/month structure and seamless Daily Notes integration._
