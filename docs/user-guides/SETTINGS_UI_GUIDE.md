# Settings UI Guide - Obsidian Link Plugin

This guide provides an overview of the comprehensive settings interface for the Obsidian Link Plugin.

## Overview

The settings UI has been completely redesigned to expose all modular settings in an organized, user-friendly interface. Settings are grouped into logical categories with validation, help text, and interactive features.

## Settings Categories

### 📁 Directory Structure

Configure how the plugin organizes your files and folders.

#### Available Settings:
- **Base Folder** - Root folder for all plugin-created directories (default: `LinkPlugin`)
- **Workspace Directory** - Directory for general notes and documents (default: `workspace`)
- **Journal Directory** - Directory for journal entries (default: `journal`)

#### Interactive Features:
- **Rebuild Directory Structure** - Button to recreate folders based on current settings
- Real-time validation with success/error messages
- Automatic settings saving

### 📅 Journal Settings

Configure date formats and templates for journal entries.

#### Available Settings:
- **Journal Date Format** - Filename format using moment.js tokens (default: `YYYY-MM-DD dddd`)
- **Journal Folder Format** - Date-based folder organization (default: `YYYY/MM`)
- **Journal Template** - Multi-line template with placeholder support

#### Interactive Features:
- **Create Monthly Folders** - Button to pre-create folders for the current year
- **Format Validation** - Real-time validation of date formats
- **Template Variables** - Support for `{{date}}`, `{{title}}`, `{{previous}}`, `{{next}}`

### 📝 Note Creation

Configure templates and behavior for new note creation.

#### Available Settings:
- **Note Template** - Default template for new notes with placeholder support
- **Open New Notes** - Toggle to automatically open newly created notes

#### Interactive Features:
- **Template Validation** - Checks for required variables and malformed syntax
- **Template Variables** - Support for `{{title}}`, `{{date}}`, `{{source}}`
- Large text area for comfortable template editing

### ⚡ Shortcodes

Configure the shortcode system for rapid content creation.

#### Available Settings:
- **Enable Shortcodes** - Toggle to enable/disable the shortcode system
- **Trigger Key** - Dropdown to select trigger key (Tab, Enter, Space)

#### Interactive Features:
- **Built-in Shortcodes Display** - Shows available shortcode patterns
- **Custom Shortcode Management** - Add, view, and delete custom shortcodes
- **Pattern Validation** - Validates shortcode syntax
- **Modal Dialog** - User-friendly interface for adding custom shortcodes

#### Built-in Shortcodes:
- `table3x4` - Creates a 3x4 table structure
- `h2+ul>li*3` - Creates heading with 3-item list
- `div>h3+ul>li*5` - Creates section with heading and 5 list items
- `link[url]{text}` - Creates markdown link

### ⚙️ General Settings

General plugin configuration and debugging options.

#### Available Settings:
- **Debug Mode** - Toggle for detailed logging and troubleshooting

#### Interactive Features:
- **Debug Information** - Automatically logs debug info when enabled
- Console output includes settings, DateService status, and more

### 🔧 Advanced

Advanced settings and maintenance tools.

#### Available Features:
- **Validate Settings** - Comprehensive settings validation with detailed feedback
- **Reset to Defaults** - Reset all settings with confirmation dialog
- **Export Settings** - Copy settings as JSON to clipboard

#### Interactive Features:
- **Validation Results** - Displays errors, warnings, and success messages
- **Confirmation Dialogs** - Prevents accidental data loss
- **Clipboard Integration** - Easy settings backup and sharing

## User Experience Features

### Real-time Validation
- **Format Validation** - Date formats are validated as you type
- **Template Validation** - Templates are checked for required variables
- **Pattern Validation** - Shortcode patterns are validated for syntax
- **Visual Feedback** - Success (✅) and error (❌) messages with colors

### Interactive Elements
- **Action Buttons** - Rebuild directories, create folders, validate settings
- **Modal Dialogs** - User-friendly interfaces for complex operations
- **Tooltips** - Helpful hints and descriptions
- **Success Messages** - Temporary notifications for successful operations

### Responsive Design
- **Organized Layout** - Clear sections with icons and descriptions
- **Proper Spacing** - Comfortable reading and interaction
- **CSS Variables** - Respects Obsidian's theme colors
- **Accessible** - Proper labels, descriptions, and keyboard navigation

## Settings Persistence

### Automatic Saving
- All settings are automatically saved when changed
- No need for manual save buttons
- Changes take effect immediately

### Validation Before Save
- Invalid values are not saved
- User receives immediate feedback
- Previous valid values are preserved

### Error Handling
- Graceful handling of save failures
- User-friendly error messages
- Recovery options provided

## Advanced Features

### Settings Validation
The "Validate Settings" button performs comprehensive checks:
- **Template Variables** - Ensures required placeholders exist
- **Date Formats** - Validates moment.js format strings
- **Shortcode Patterns** - Checks syntax and structure
- **Directory Names** - Validates folder naming conventions

### Settings Export/Import
- **Export** - Copy current settings as formatted JSON
- **Backup** - Easy way to save configuration
- **Sharing** - Share configurations between installations

### Reset Functionality
- **Confirmation Dialog** - Prevents accidental resets
- **Complete Reset** - Restores all default values
- **Immediate Refresh** - UI updates automatically after reset

## Development Notes

### Modular Architecture
The settings UI is built using the modular settings system:
- Each category corresponds to a settings module
- Validation uses module-specific validators
- Easy to extend with new setting categories

### Type Safety
- Full TypeScript integration
- Compile-time validation of setting types
- Runtime validation with detailed error messages

### Performance
- Efficient DOM updates
- Minimal re-rendering
- Lazy loading of validation results

## Usage Tips

### Getting Started
1. Open Obsidian Settings
2. Navigate to "Community Plugins"
3. Find "Link Plugin" in the installed plugins
4. Click the gear icon to open settings

### Best Practices
- **Test Changes** - Use validation buttons after making changes
- **Backup Settings** - Export settings before major changes
- **Start Simple** - Use default settings initially, then customize
- **Read Descriptions** - Hover over setting names for detailed help

### Troubleshooting
- **Validation Errors** - Check the validation messages for specific issues
- **Reset if Needed** - Use the reset button if settings become corrupted
- **Debug Mode** - Enable for detailed logging information
- **Export/Import** - Use for backing up working configurations

## Future Enhancements

### Planned Features
- **Import Settings** - Load settings from JSON
- **Setting Profiles** - Multiple configuration presets
- **Advanced Templates** - More template variables and functions
- **Shortcode Library** - Community-shared shortcode patterns

### Customization Options
- **Theme Integration** - Better integration with Obsidian themes
- **Keyboard Shortcuts** - Hotkeys for common settings operations
- **Contextual Help** - In-app help system with examples

### Daily Notes Integration Settings ✨ NEW

#### **Main Integration Toggle**
**Enable Daily Notes Integration**
- **Purpose**: Master switch for all Daily Notes integration features
- **Safety**: All changes are backed up automatically
- **Scope**: Affects Obsidian's Daily Notes plugin settings

#### **Quick Controls** (shown when integration enabled)
**Enable All Controls** / **Disable All Controls**
- **Purpose**: Bulk enable/disable all integration controls
- **Convenience**: Avoid clicking individual checkboxes
- **Effect**: Updates all three control checkboxes at once

#### **Individual Controls** (shown when integration enabled)

**📁 Control Folder Location**
- **Function**: Updates Daily Notes folder to use our monthly structure
- **Example**: Changes from `Daily Notes` to `Link/journal/2025/07-July`
- **Benefit**: Daily notes automatically appear in organized folders

**📅 Control Date Format**
- **Function**: Updates Daily Notes date format to match journal format
- **Example**: Changes from `YYYY-MM-DD` to `YYYY-MM-DD dddd`
- **Benefit**: Consistent naming across all daily notes

**📝 Control Template**
- **Function**: Updates Daily Notes template to use our template
- **Example**: Sets template to `Link/templates/Daily Notes Template.md`
- **Benefit**: Consistent template with Templater integration

#### **Apply Integration Settings**
**Apply Now Button**
- **Function**: Applies selected controls to Daily Notes plugin
- **Safety**: Creates automatic backup before any changes
- **Feedback**: Shows success/error messages
- **One-Time Setup**: Backup created only once per vault

#### **Backup Information** (shown when backup exists)
**📦 Backup Information**
- **Display**: Shows backup creation date and plugin type
- **Example**: "Backup created: 12/07/2025, 14:32:15 (core plugin)"
- **Purpose**: Confirms your settings are safely backed up

#### **⚠️ Danger Zone** (shown when backup exists)
**Restore Original Settings**
- **Function**: Restores Daily Notes to original settings
- **Warning**: Prominently displayed with red styling
- **Confirmation**: Requires explicit confirmation dialog
- **Effect**: Disables integration, deletes backup, restores original settings
- **Irreversible**: Cannot be undone once confirmed

## 🔧 Configuration Workflows

### Basic Setup (First Time)
1. **Keep Defaults**: Base folder "Link" works for most users
2. **Rebuild Structure**: Click to create initial folders
3. **Setup Templates**: Click to create template with Templater compatibility
4. **Configure Journal**: Adjust date formats if desired

### Daily Notes Integration Setup
1. **Enable Integration**: Toggle main switch
2. **Select Controls**: Choose which aspects to manage (folder/format/template)
3. **Enable All**: Use quick control for convenience (optional)
4. **Apply Settings**: Click "Apply Now" to create backup and activate
5. **Verify**: Check that backup information appears

### Changing Settings Later
1. **Journal Settings**: Changes take effect immediately
2. **Integration Controls**: Must click "Apply Now" for changes to take effect
3. **Directory Structure**: Use "Rebuild" if major changes needed

### Restoring Original Settings (If Needed)
1. **Scroll to Danger Zone**: Bottom of Daily Notes Integration section
2. **Read Warning**: Understand consequences before proceeding
3. **Click Restore**: "Restore & Disable" button
4. **Confirm**: Acknowledge in confirmation dialog
5. **Complete**: Integration disabled, original settings restored

## 🎯 Settings Best Practices

### Recommended Configuration
```
Base Folder: "Link"
Simple Journal Mode: Disabled
Year Format: "YYYY"
Month Format: "MM-MMMM"
Daily Note Format: "YYYY-MM-DD dddd"
Daily Notes Integration: Enabled with all controls
```

### Format String Examples

#### Year Formats
- `YYYY` → "2025"
- `YY` → "25"
- `YYYY [Year]` → "2025 Year"

#### Month Formats
- `MM-MMMM` → "07-July" (recommended)
- `MMMM` → "July"
- `MM` → "07"
- `MMM YYYY` → "Jul 2025"

#### Daily Note Formats
- `YYYY-MM-DD dddd` → "2025-07-01 Tuesday" (recommended)
- `YYYY-MM-DD` → "2025-07-01"
- `dddd, MMMM Do` → "Tuesday, July 1st"
- `YYYY.MM.DD` → "2025.07.01"

## 🛡️ Safety Features

### Automatic Safeguards
- **Backup Creation**: Original settings backed up automatically
- **Confirmation Dialogs**: Important actions require confirmation
- **Error Handling**: Graceful failure with user notifications
- **Logging**: All operations logged for troubleshooting

### Visual Indicators
- **Success Messages**: Green checkmarks for successful operations
- **Warning Text**: Yellow warnings for important information
- **Error Messages**: Red text for problems requiring attention
- **Danger Zone**: Red styling for potentially destructive actions

### Recovery Options
- **Complete Restore**: Return to original Daily Notes settings
- **Plugin Disable**: Turn off plugin without losing configuration
- **Rebuild Structure**: Recreate folders if they're accidentally deleted
- **Settings Reset**: Return to plugin defaults (manual via settings file)

## 📋 Troubleshooting

### Common Issues

**Integration section not visible**
- Ensure Daily Notes plugin (core or community) is installed and enabled
- Check that you're in the correct settings tab

**Apply button does nothing**
- Check console for error messages
- Verify Daily Notes plugin is functioning
- Try disabling and re-enabling Daily Notes plugin

**Wrong folder structure created**
- Check journal settings formats are valid moment.js formats
- Use "Rebuild Directory Structure" to recreate folders
- Verify base folder path is correct

**Backup not working**
- Plugin will create backup automatically on first "Apply Now"
- Check that Daily Notes plugin is accessible
- Verify plugin permissions in Obsidian settings

### Settings Validation
The plugin validates settings in real-time:
- **Invalid Format Strings**: Will show error messages
- **Missing Required Fields**: Highlighted with warnings
- **Conflicting Settings**: Warnings about potential issues

### Reset Instructions
To completely reset plugin settings:
1. Disable plugin in Community Plugins
2. Delete plugin data file: `.obsidian/plugins/obsidian-link-plugin/data.json`
3. Re-enable plugin (will recreate with defaults)
4. Reconfigure as needed

---

**Remember**: The settings UI is designed to be self-explanatory with helpful descriptions. When in doubt, hover over settings for additional information or check the reference documentation in your vault's `Link/reference/` folder. 