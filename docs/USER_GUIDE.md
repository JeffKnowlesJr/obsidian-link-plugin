# User Guide - DateFolders for DailyNotes

A comprehensive guide for using the DateFolders for DailyNotes plugin for automatic date-based folder organization.

## 📖 Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Plugin Control](#plugin-control)
- [Features](#features)
- [Configuration](#configuration)
- [Usage](#usage)
- [Troubleshooting](#troubleshooting)
- [Advanced Usage](#advanced-usage)

## Overview

The DateFolders for DailyNotes plugin is a minimal date-based folder organization system that provides automatic year/month folder structure and seamless Daily Notes integration. It automatically creates organized folder structures for daily notes.

### What It Does

- **Automatic Year/Month Folders**: Creates organized folder structure (e.g., `2025/July/`)
- **Configurable Formats**: Set custom year, month, and daily note formats
- **Future Note Creation**: Create daily notes for future dates
- **Daily Notes Integration**: Seamless integration with Obsidian's Daily Notes plugin
- **Settings Backup**: Safely backs up and restores Daily Notes settings

## Installation

### Prerequisites
- Obsidian v1.0.0 or later
- Community plugins enabled

### Installation Steps

1. **Open Obsidian Settings** → Community Plugins
2. **Disable Safe Mode** if enabled
3. **Browse and search** for "DateFolders for DailyNotes"
4. **Install and enable** the plugin

### Post-Installation Setup

1. **Enable the Plugin**: Go to Settings → Plugin Status → Enable Plugin
2. **Configure Settings**: Access via the ribbon button or Settings → Community Plugins → DateFolders for DailyNotes
3. **Set Base Folder**: Choose where your daily notes structure will be created (default: "DateFolders")
4. **Enable Daily Notes Integration**: If you use the Daily Notes plugin

## Quick Start

### Basic Usage (All You Need)

1. **Enable the Plugin**: Go to Settings → Plugin Status → Enable Plugin
2. **Create Today's Note**: Click the "📝" ribbon button (appears when plugin is enabled)
3. **Configure Monthly Structure**: Use Settings to set folder formats
4. **That's It**: The plugin handles the rest automatically

### First-Time Setup

1. **Open Settings**: Click the ribbon button or go to Settings → Community Plugins → Journal Plugin
2. **Enable Plugin**: Go to Plugin Status section and enable the plugin
3. **Configure Daily Notes Settings**:
   - **Daily Note Format**: `YYYY-MM-DD dddd` creates "2025-07-01 Tuesday"
   - **Year Format**: `YYYY` creates "2025"
   - **Month Format**: `MMMM` creates "July"
4. **Enable Daily Notes Integration** (optional)
5. **Test**: Create your first daily note

## Plugin Control

### Enable/Disable Plugin

The plugin starts **disabled by default** for safety. This means:
- No automatic folder creation
- No Daily Notes integration changes

- Ribbon buttons for journal functions are hidden

**To Enable:**
1. Go to Settings → Plugin Status → Enable Plugin
2. The plugin will automatically:
   - Create the directory structure

   - Configure Daily Notes integration (if enabled)
   - Show functional ribbon buttons

**To Disable:**
1. Go to Settings → Plugin Status → Disable Plugin
2. The plugin will stop performing operations
3. Functional ribbon buttons will be hidden
4. Settings ribbon button remains available for re-enabling

### Ribbon Button Management

**Settings Ribbon Button:**
- **Default**: Visible (allows easy access to settings)
- **Control**: Toggle "Show Ribbon Button" in Plugin Status settings
- **Purpose**: Quick access to plugin settings

**Functional Ribbon Buttons:**
- **Calendar Plus**: Create future daily notes (only visible when plugin is enabled)
- **Settings**: Access plugin settings (visibility controlled by toggle)

### Safe Defaults

- **Plugin Disabled**: No automatic operations until you're ready
- **Settings Accessible**: You can always access settings via Community Plugins menu
- **No Conflicts**: Plugin won't interfere with existing files until enabled

## Features

### Date-Based Folder Structure
- **Automatic Year/Month Folders**: Creates organized folder structure (e.g., `2025/July/`)
- **Configurable Formats**: Set custom year, month, and daily note formats
- **Future Note Creation**: Create daily notes for future dates

### Daily Notes Integration
- **Optional Integration**: Works with Obsidian's Daily Notes plugin
- **Settings Backup**: Safely backs up and restores Daily Notes settings


### 📁 Folder Structure

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


## Configuration

### Plugin Status Settings

Access settings via Settings → Community Plugins → DateFolders for DailyNotes:

#### Plugin Control
- **Enable Plugin**: Turn the plugin on/off to control when operations are performed
- **Show Ribbon Button**: Control visibility of the settings ribbon button

### Core Settings

#### Daily Notes Settings
- **Base Folder**: Set the root folder for daily notes
- **Year Folder Format**: Configure year folder naming (default: `YYYY`)
- **Month Folder Format**: Configure month folder naming (default: `MMMM`) 
- **Daily Note Format**: Customize daily note naming (default: `YYYY-MM-DD dddd`)

#### Daily Notes Integration
- **Enable Integration**: Toggle integration with Obsidian's Daily Notes plugin
- **Backup & Restore**: Automatic backup with one-click restore option

### Advanced Settings

#### Debug Settings
- **Debug Mode**: Enable detailed logging for troubleshooting

## Usage

### Commands

The plugin provides several commands for journal management (only available when plugin is enabled):

- **Rebuild Directory Structure**: Recreates the plugin's directory structure
- **Open Today's Daily Note**: Opens or creates today's daily note entry
- **Create Today's Daily Note**: Creates today's note using Daily Notes integration
- **Create Future Daily Note**: Creates a note for a specific future date
- **Create Monthly Folders**: Creates monthly folders for the current year

### Ribbon Buttons

**When Plugin is Enabled:**
- **📝 Create Today's Note**: Quick access to today's daily note entry
- **📅 Create Future Note**: Select a date to create a future note
- **⚙️ Settings**: Quick access to plugin settings (if ribbon button is enabled)

**When Plugin is Disabled:**
- **⚙️ Settings**: Quick access to plugin settings (if ribbon button is enabled)
- Functional buttons are hidden until plugin is enabled

### Daily Notes Integration

1. **Enable Plugin**: First enable the plugin in Plugin Status settings
2. **Enable Integration**: In plugin settings, enable Daily Notes integration
3. **Configure Settings**: The plugin will automatically configure Daily Notes settings
4. **Use Daily Notes Commands**: Use Obsidian's Daily Notes commands to create daily note entries
5. **Automatic Synchronization**: Settings are automatically synchronized



## Troubleshooting

### Common Issues

#### Plugin Not Working
1. **Check Plugin Status**: Ensure the plugin is enabled in Plugin Status settings
2. **Check Installation**: Ensure the plugin is installed and enabled in Community Plugins
3. **Check Settings**: Verify settings are configured correctly
4. **Check Permissions**: Ensure Obsidian has file system permissions
5. **Check Debug Mode**: Enable debug mode for detailed logging



#### Ribbon Buttons Not Visible
1. **Check Plugin Status**: Functional buttons only appear when plugin is enabled
2. **Check Ribbon Settings**: Ensure "Show Ribbon Button" is enabled for settings access
3. **Restart Obsidian**: Try restarting Obsidian if buttons don't appear
4. **Check Community Plugins**: Access settings via Settings → Community Plugins → Journal Plugin

#### Daily Notes Integration Issues
1. **Enable Plugin**: Make sure the plugin is enabled first
2. **Enable Integration**: Check that Daily Notes integration is enabled in settings
3. **Check Backup**: Verify that a backup was created before integration
4. **Restore Settings**: Use the restore function if integration causes issues 