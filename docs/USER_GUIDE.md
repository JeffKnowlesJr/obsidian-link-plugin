# User Guide - Obsidian Link Plugin

A comprehensive guide for using the Obsidian Link Plugin for intelligent daily note organization.

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

The Obsidian Link Plugin is a focused daily note organization system that provides intelligent monthly folder management and seamless Daily Notes integration. It automatically creates organized folder structures and integrates with Obsidian's Daily Notes plugin.

### What It Does

- **Automatic Monthly Folders**: Creates `2025/July/` folders automatically
- **Reliable Date Detection**: Ensures notes for any day are placed in the correct monthly folder
- **Daily Notes Integration**: Works seamlessly with Obsidian's Daily Notes plugin
- **Future Note Creation**: Plan ahead with future daily notes
- **Template Support**: Integrated with Templater plugin for dynamic date navigation
- **Smart Plugin Control**: Enable/disable functionality to control when operations are performed

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

1. **Enable the Plugin**: Go to Settings → Plugin Status → Enable Plugin
2. **Configure Settings**: Access via the ribbon button or Settings → Community Plugins → Link Plugin
3. **Set Base Folder**: Choose where your journal structure will be created (default: "Link")
4. **Enable Daily Notes Integration**: If you use the Daily Notes plugin

## Quick Start

### Basic Usage (All You Need)

1. **Enable the Plugin**: Go to Settings → Plugin Status → Enable Plugin
2. **Create Today's Note**: Click the "📝" ribbon button (appears when plugin is enabled)
3. **Configure Monthly Structure**: Use Settings to set folder formats
4. **That's It**: The plugin handles the rest automatically

### First-Time Setup

1. **Open Settings**: Click the ribbon button or go to Settings → Community Plugins → Link Plugin
2. **Enable Plugin**: Go to Plugin Status section and enable the plugin
3. **Configure Journal Settings**:
   - **Daily Note Format**: `YYYY-MM-DD dddd` creates "2025-07-01 Tuesday"
   - **Year Format**: `YYYY` creates "2025"
   - **Month Format**: `MMMM` creates "July"
4. **Enable Daily Notes Integration** (optional)
5. **Test**: Create your first journal entry

## Plugin Control

### Enable/Disable Plugin

The plugin starts **disabled by default** for safety. This means:
- No automatic folder creation
- No Daily Notes integration changes
- No template setup
- Ribbon buttons for journal functions are hidden

**To Enable:**
1. Go to Settings → Plugin Status → Enable Plugin
2. The plugin will automatically:
   - Create the directory structure
   - Set up templates
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
- **Template Auto-Setup**: Templates are created automatically when plugin is enabled
- **No Conflicts**: Plugin won't interfere with existing files until enabled

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

### 🎛️ Smart Plugin Control

- **Enable/Disable Plugin**: Control when the plugin performs operations
- **Ribbon Button Management**: Show or hide the settings ribbon button
- **No Automatic Operations**: Plugin starts disabled by default - no folder creation until you're ready
- **Template Auto-Setup**: Templates are automatically created when the plugin is enabled

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

### Plugin Status Settings

Access settings via the ribbon button or Settings → Community Plugins → Link Plugin:

#### Plugin Control
- **Enable Plugin**: Turn the plugin on/off to control when operations are performed
- **Show Ribbon Button**: Control visibility of the settings ribbon button

### Core Settings

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

The plugin provides several commands for journal management (only available when plugin is enabled):

- **Rebuild Directory Structure**: Recreates the plugin's directory structure
- **Open Today's Journal**: Opens or creates today's journal entry
- **Create Today's Daily Note**: Creates today's note using Daily Notes integration
- **Create Future Daily Note**: Creates a note for a specific future date
- **Create Monthly Folders**: Creates monthly folders for the current year

### Ribbon Buttons

**When Plugin is Enabled:**
- **📝 Create Today's Note**: Quick access to today's journal entry
- **📅 Create Future Note**: Select a date to create a future note
- **⚙️ Settings**: Quick access to plugin settings (if ribbon button is enabled)

**When Plugin is Disabled:**
- **⚙️ Settings**: Quick access to plugin settings (if ribbon button is enabled)
- Functional buttons are hidden until plugin is enabled

### Daily Notes Integration

1. **Enable Plugin**: First enable the plugin in Plugin Status settings
2. **Enable Integration**: In plugin settings, enable Daily Notes integration
3. **Configure Settings**: The plugin will automatically configure Daily Notes settings
4. **Use Daily Notes Commands**: Use Obsidian's Daily Notes commands to create journal entries
5. **Automatic Synchronization**: Settings are automatically synchronized

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
1. **Check Plugin Status**: Ensure the plugin is enabled in Plugin Status settings
2. **Check Installation**: Ensure the plugin is installed and enabled in Community Plugins
3. **Check Settings**: Verify settings are configured correctly
4. **Check Permissions**: Ensure Obsidian has file system permissions
5. **Check Debug Mode**: Enable debug mode for detailed logging

#### Template File Not Found
1. **Enable Plugin**: Make sure the plugin is enabled in Plugin Status settings
2. **Check Template Setup**: Templates are automatically created when plugin is enabled
3. **Manual Setup**: Use the "Setup Templates" button in Journal Template Settings
4. **Check Path**: Verify the template path in settings matches your file structure

#### Ribbon Buttons Not Visible
1. **Check Plugin Status**: Functional buttons only appear when plugin is enabled
2. **Check Ribbon Settings**: Ensure "Show Ribbon Button" is enabled for settings access
3. **Restart Obsidian**: Try restarting Obsidian if buttons don't appear
4. **Check Community Plugins**: Access settings via Settings → Community Plugins → Link Plugin

#### Daily Notes Integration Issues
1. **Enable Plugin**: Make sure the plugin is enabled first
2. **Enable Integration**: Check that Daily Notes integration is enabled in settings
3. **Check Backup**: Verify that a backup was created before integration
4. **Restore Settings**: Use the restore function if integration causes issues 