# Obsidian Link Plugin v2.3.0

A focused Obsidian plugin for **intelligent daily note organization** with automatic monthly folder management and seamless Daily Notes integration. No clutter, just the core functionality that matters.

## 🚀 What's New in v2.3.0

- **NEW: Daily Notes Integration**: Seamlessly integrate with Obsidian's Daily Notes plugin with automatic backup and restore
- **Granular Control**: Choose exactly which Daily Notes settings to manage (folder, format, template)
- **Automatic Backup**: Your original Daily Notes settings are safely backed up before any changes
- **Template System**: Integrated template creation with Templater plugin compatibility
- **Reference Documentation**: Built-in knowledge base documenting all architectural decisions and patterns
- **Comprehensive Restore**: One-click restore to original Daily Notes settings

## ✨ Core Features

### 🎯 Smart Daily Note Management

- **Automatic Monthly Folders**: Creates `2025/July/` folders automatically on July 1st
- **Correct Date Detection**: Fixed the MMmmmm format bug that caused July notes to go in wrong folder
- **Customizable Structure**: Configure year (`YYYY`) and month (`MMMM`) formats that actually work
- **Today's Note Button**: One-click access to today's journal entry
- **Future Note Creation**: Plan ahead with future daily notes

### 🔗 Daily Notes Integration

- **Seamless Integration**: Works alongside Obsidian's Daily Notes plugin without conflicts
- **Automatic Backup**: Backs up your original Daily Notes settings before making any changes
- **Granular Control**: Choose which settings to manage (folder location, date format, template)
- **Safe Restore**: One-click restore to your original settings with confirmation
- **Template Support**: Integrated with Templater plugin for dynamic date navigation

## 📁 Folder Structure (Simple & Working)

The plugin creates this organized structure:

```
Link/
├── journal/
│   ├── 2025/                    # Year folders
│   │   ├── July/                # Month folders (FIXED: July 1st notes go here!)
│   │   ├── August/
│   │   └── ...
│   └── [your daily notes]
├── templates/
│   └── Daily Notes Template.md  # Created with Templater compatibility
└── reference/
    └── linkplugin/             # All reference files are generated inside this subfolder
        ├── Architecture Decisions.md
        ├── Development Patterns.md
        ├── Integration Guide.md
        ├── Troubleshooting Lessons.md
        └── ... (other subfolders/files as needed)
```

**Key Benefits:**

- **Actually Works**: July 1st notes go in July folder (fixed the core bug)
- **No Conflicts**: Everything contained within configurable base folder (default: "Link")
- **Clean Organization**: Sibling directories for different purposes
- **Reference Subfolders**: All reference files are organized inside a `linkplugin` subfolder, and the reference folder can contain additional subfolders for further organization
- **Self-Documenting**: Built-in reference documentation explains all design decisions

## 🛠️ Installation

1. Open Obsidian Settings → Community Plugins
2. Disable Safe Mode if enabled
3. Browse and search for "Link Plugin"
4. Install and enable the plugin

## 📖 Quick Start

### Basic Usage (All You Need)

1. **Create Today's Note**: Click the "📝" ribbon button
2. **Configure Monthly Structure**: Use Settings to set folder formats
3. **That's It**: The plugin handles the rest automatically

### Settings That Matter

- **Daily Note Format**: `YYYY-MM-DD dddd` creates "2025-07-01 Tuesday"
- **Year Format**: `YYYY` creates "2025"
- **Month Format**: `MMMM` creates "July" (FIXED: was using invalid MMmmmm)
- **Daily Notes Integration**: Control how the plugin integrates with Daily Notes plugin
- **Template Setup**: One-click template creation with Templater compatibility

## ⚙️ Configuration

Access settings via the ribbon button:

### Journal Settings

- **Simple Journal Mode**: Single folder vs. organized year/month structure
- **Year Folder Format**: Configure year folder naming (default: `YYYY`)
- **Month Folder Format**: Configure month folder naming (default: `MMMM` - FIXED!)
- **Daily Note Format**: Customize daily note naming (default: `YYYY-MM-DD dddd`)

### Daily Notes Integration Settings

- **Enable Integration**: Toggle integration with Daily Notes plugin
- **Granular Controls**: Individual checkboxes for folder, format, and template control
- **Quick Controls**: Enable/disable all controls at once
- **Backup & Restore**: Automatic backup with one-click restore in danger zone

## 🗂️ What's Been Removed (Moved to Quarantine)

To fix the core July 1st issue and eliminate complexity:

- **File Sorting System**: Complex frontmatter-based organization (too distracting)
- **Auto-Sort Features**: Automatic file movement based on metadata
- **Bulk Sorting**: Preview and organize existing files
- **Multiple Ribbon Buttons**: Reduced from 6 to 2 essential buttons

## ✅ What Actually Works Now

### Fixed Issues

- ✅ **July 1st Bug**: Daily notes now correctly create in July folder
- ✅ **Date Format**: Fixed invalid `MMmmmm` format that caused wrong folders
- ✅ **Month Detection**: Proper moment.js formatting ensures correct month
- ✅ **Template Conflicts**: Fixed Templater integration to avoid processing conflicts
- ✅ **Directory Structure**: Templates now siblings to journal (better organization)

### Core Functionality

- ✅ **Daily Note Creation**: One-click today's note
- ✅ **Monthly Folders**: Automatic creation based on current date
- ✅ **Future Notes**: Plan ahead with any future date
- ✅ **Daily Notes Integration**: Seamless integration with backup and restore
- ✅ **Template System**: Integrated template creation with Templater compatibility
- ✅ **Reference Documentation**: Built-in architectural knowledge base

## 🚧 Development

### Building the Plugin

```bash
npm install          # Install dependencies
npm run build       # Production build (now working!)
```

### Project Status

- **Current Version**: 2.2.0 (Journal-Focused Release)
- **Core Bug**: FIXED - July 1st notes now go in July folder
- **Architecture**: Simplified TypeScript focused on journal management
- **Complexity**: REMOVED - file sorting moved to quarantine

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

## 📊 Version History

### v2.3.0 (Current) - Integration Release

- ✅ **NEW: Daily Notes Integration**: Seamless integration with automatic backup and restore
- ✅ **Granular Control System**: Individual controls for folder, format, and template
- ✅ **Template System**: Integrated template creation with Templater compatibility
- ✅ **Reference Documentation**: Built-in architectural knowledge base
- ✅ **Safety Features**: Automatic backup, danger zone, confirmation dialogs
- ✅ **Directory Restructure**: Templates as siblings to journal for better organization

### v2.2.0 - Journal-Focused Release

- ✅ **FIXED: July 1st Bug**: Daily notes now correctly create in July folder
- ✅ **Date Format Fix**: Changed invalid `MMmmmm` to proper `MMMM` format
- ✅ **Simplified Interface**: Reduced to 2 essential ribbon buttons
- ✅ **Quarantined File Sorting**: Moved complex features to quarantine folder
- ✅ **Clean Settings UI**: Focus only on journal management
- ❌ **Removed**: File sorting, auto-organization, bulk operations

### v2.1.0 - Foundation Release (Had the July Bug)

- ❌ Complex file sorting that distracted from core functionality
- ❌ Invalid date format causing July 1st notes to go in wrong folder

---

_The Obsidian Link Plugin now does one thing really well: intelligent daily note organization with seamless Daily Notes integration. The July 1st issue is fixed, Daily Notes integration is safe and comprehensive, and you get a clean, focused tool for journal management that works alongside your existing workflow._
