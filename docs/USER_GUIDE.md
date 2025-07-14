# User Guide - Obsidian Link Plugin

A comprehensive guide for using the Obsidian Link Plugin for intelligent daily note organization.

## 📖 Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Features](#features)
- [Configuration](#configuration)
- [Usage](#usage)
- [Troubleshooting](#troubleshooting)
- [Advanced Usage](#advanced-usage)

## Overview

The Obsidian Link Plugin is a focused daily note organization system that provides intelligent monthly folder management and seamless Daily Notes integration. It automatically creates organized folder structures and integrates with Obsidian's Daily Notes plugin.

### What It Does

- **Automatic Monthly Folders**: Creates `2025/July/` folders automatically
- **Reliable Date Detection**: Ensures notes for any day are placed in the correct monthly folder
- **Daily Notes Integration**: Works seamlessly with Obsidian's Daily Notes plugin
- **Future Note Creation**: Plan ahead with future daily notes
- **Template Support**: Integrated with Templater plugin for dynamic date navigation

## Installation

### Prerequisites
- Obsidian v1.0.0 or later
- Community plugins enabled

### Installation Steps

1. **Open Obsidian Settings** → Community Plugins
2. **Disable Safe Mode** if enabled
3. **Browse and search** for "Link Plugin"
4. **Install and enable** the plugin

### Post-Installation Setup

1. **Configure Settings**: Access via the ribbon button or Settings → Community Plugins → Link Plugin
2. **Set Base Folder**: Choose where your journal structure will be created (default: "Link")
3. **Enable Daily Notes Integration**: If you use the Daily Notes plugin

## Quick Start

### Basic Usage (All You Need)

1. **Create Today's Note**: Click the "📝" ribbon button
2. **Configure Monthly Structure**: Use Settings to set folder formats
3. **That's It**: The plugin handles the rest automatically

### First-Time Setup

1. **Open Settings**: Click the ribbon button or go to Settings → Community Plugins → Link Plugin
2. **Configure Journal Settings**:
   - **Daily Note Format**: `YYYY-MM-DD dddd` creates "2025-07-01 Tuesday"
   - **Year Format**: `YYYY` creates "2025"
   - **Month Format**: `MMMM` creates "July"
3. **Enable Daily Notes Integration** (optional)
4. **Test**: Create your first journal entry

## Features

### 🎯 Smart Daily Note Management

- **Automatic Monthly Folders**: Creates year/month folder structures automatically
- **Reliable Date Detection**: Ensures notes for any day, including the 1st of the month, are placed in the correct monthly folder
- **Customizable Structure**: Configure year (`YYYY`) and month (`MMMM`) folder formats
- **Future Note Creation**: Plan ahead with future daily notes

### 🔗 Daily Notes Integration

- **Seamless Integration**: Works alongside Obsidian's Daily Notes plugin without conflicts
- **Automatic Backup**: Backs up your original Daily Notes settings before making any changes
- **Granular Control**: Choose which settings to manage (folder location, date format, template)
- **Safe Restore**: One-click restore to your original by disabling the plugin
- **Template Support**: Integrated with Templater plugin for dynamic date navigation

### 📁 Folder Structure

The plugin creates this organized structure:

```
Link/
├── journal/
│   ├── 2025/                    # Year folders
│   │   ├── July/                # Month folders
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
- **Reliable Organization**: Your notes are always placed in the correct year and month folders
- **No Conflicts**: Everything contained within configurable base folder (default: "Link")
- **Clean Organization**: Sibling directories for different purposes
- **Reference Subfolders**: All reference files are organized inside a `linkplugin` subfolder

## Configuration

### Core Settings

Access settings via the ribbon button or Settings → Community Plugins → Link Plugin:

#### Journal Settings
- **Year Folder Format**: Configure year folder naming (default: `YYYY`)
- **Month Folder Format**: Configure month folder naming (default: `MMMM`)
- **Daily Note Format**: Customize daily note naming (default: `YYYY-MM-DD dddd`)

#### Daily Notes Integration Settings
- **Enable Integration**: Toggle integration with the Daily Notes plugin
- **Granular Controls**: Individual checkboxes for folder, format, and template control
- **Quick Controls**: Enable/disable all controls at once
- **Backup & Restore**: Automatic backup with a one-click restore in the danger zone

### Advanced Settings

#### Directory Structure
- **Base Folder**: Root folder for all plugin-created directories (default: "Link")
- **Directory Structure**: Array of core directories to create
- **Journal Root Folder**: Main journal folder name
- **Simple Journal Mode**: Toggle between simple and dynamic folder structures

#### Template Settings
- **Journal Template**: Template content for new journal entries
- **Custom Template Location**: Override default template location
- **Template Setup**: One-click template creation with Templater compatibility

#### Debug Settings
- **Debug Mode**: Enable detailed logging for troubleshooting
- **Restricted Directories**: Directories to avoid when creating structure

## Usage

### Commands

The plugin provides several commands for journal management:

- **Rebuild Directory Structure**: Recreates the plugin's directory structure
- **Open Today's Journal**: Opens or creates today's journal entry
- **Create Today's Daily Note**: Creates today's note using Daily Notes integration
- **Create Future Daily Note**: Creates a note for a specific future date
- **Create Monthly Folders**: Creates monthly folders for the current year

### Ribbon Buttons

- **📝 Create Today's Note**: Quick access to today's journal entry
- **📅 Create Future Note**: Select a date to create a future note
- **⚙️ Settings**: Quick access to plugin settings

### Daily Notes Integration

1. **Enable Integration**: In plugin settings, enable Daily Notes integration
2. **Configure Settings**: The plugin will automatically configure Daily Notes settings
3. **Use Daily Notes Commands**: Use Obsidian's Daily Notes commands to create journal entries
4. **Automatic Synchronization**: Settings are automatically synchronized

### Template Usage

The plugin creates templates with placeholders:

```markdown
# {{date}}
## Daily Log
## Tasks
- [ ] 
## Notes
## Reflection
---
Previous: {{previous}}
Next: {{next}}
```

**Available Placeholders:**
- `{{date}}`: Current date in configured format
- `{{previous}}`: Link to previous day's entry
- `{{next}}`: Link to next day's entry

## Troubleshooting

### Common Issues

#### Plugin Not Working
1. **Check Installation**: Ensure the plugin is installed and enabled
2. **Check Settings**: Verify settings are configured correctly
3. **Check Permissions**: Ensure Obsidian has file system permissions
4. **Check Debug Mode**: Enable debug mode for detailed logging

#### Daily Notes Integration Issues
1. **Check Plugin Status**: Ensure Daily Notes plugin is installed and enabled
2. **Check Integration Settings**: Verify integration is enabled in settings
3. **Restore Settings**: Use the restore function if settings are corrupted
4. **Check Backup**: Verify backup was created before integration

#### Folder Structure Issues
1. **Rebuild Structure**: Use "Rebuild Directory Structure" command
2. **Check Base Folder**: Verify base folder path is correct
3. **Check Permissions**: Ensure write permissions to the base folder
4. **Check Settings**: Verify directory structure settings

### Debug Mode

Enable debug mode in settings for detailed logging:

1. **Open Settings**: Plugin settings → Advanced → Debug Mode
2. **Check Console**: Open browser console (Ctrl+Shift+I) to view logs
3. **Report Issues**: Include debug logs when reporting issues

### Error Messages

#### "Failed to create directory"
- **Cause**: Permission issues or invalid path
- **Solution**: Check folder permissions and path validity

#### "Daily Notes integration failed"
- **Cause**: Daily Notes plugin not available or settings conflict
- **Solution**: Check Daily Notes plugin status and restore settings if needed

#### "Template creation failed"
- **Cause**: Template path issues or file system errors
- **Solution**: Check template location and file system permissions

## Advanced Usage

### Custom Templates

Create custom templates with advanced placeholders:

```markdown
---
title: {{date}}
created: {{date}}
tags: [daily, journal]
---

# {{date}} - Daily Journal

## Today's Goals
- [ ] 

## Notes
- 

## Reflection
- 

---
Previous: [[{{previous}}]]
Next: [[{{next}}]]
```

### Templater Integration

For advanced template functionality, integrate with the Templater plugin:

1. **Install Templater**: Community plugin for advanced templating
2. **Configure Templates**: Use Templater's advanced syntax
3. **Dynamic Navigation**: Use Templater's date functions for navigation

### Custom Folder Structures

Configure custom folder structures in settings:

```json
{
  "directoryStructure": ["journal", "notes", "projects"],
  "journalRootFolder": "journal",
  "simpleJournalMode": false
}
```

### Automation

Use the plugin's commands in Obsidian's command palette:

1. **Open Command Palette**: Ctrl+P (Cmd+P on Mac)
2. **Search Commands**: Type "Link Plugin" to find commands
3. **Execute Commands**: Use keyboard shortcuts or click commands

### Integration with Other Plugins

The plugin works well with:

- **Templater**: Advanced templating functionality
- **Calendar**: Visual calendar integration
- **Periodic Notes**: Additional note types
- **Dataview**: Query and display journal entries

## Getting Help

### Documentation
- **[Main README](../README.md)** - Overview and features
- **[Architecture Overview](ARCHITECTURE.md)** - Technical details
- **[Development Guide](DEVELOPMENT.md)** - For contributors

### Support
- **GitHub Issues**: Report bugs and request features
- **Community**: Ask questions in the Obsidian community
- **Debug Mode**: Enable for detailed troubleshooting

---

**Need more help?** Check the [Architecture Overview](ARCHITECTURE.md) for technical details or the [Development Guide](DEVELOPMENT.md) for contribution guidelines. 