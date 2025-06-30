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