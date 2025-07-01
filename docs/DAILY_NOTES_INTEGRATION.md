# Daily Notes Integration Guide

## Overview

The Obsidian Link Plugin v2.3.0 introduces seamless integration with Obsidian's Daily Notes plugin while maintaining complete safety through automatic backup and restore functionality.

## 🔐 Safety First

### Automatic Backup System
- **No Data Loss**: Your original Daily Notes settings are automatically backed up before any changes
- **Timestamp Tracking**: Backups include creation time and plugin type (core vs community)
- **Complete Restoration**: Restore to exact original state with one click
- **Safe Operation**: Plugin never modifies settings without user explicit consent

### Backup Process
1. When you first apply integration settings, plugin automatically creates backup
2. Backup includes all original Daily Notes settings (folder, format, template, etc.)
3. Backup is stored in plugin settings and persists across Obsidian restarts
4. Only one backup is created - subsequent applications use existing backup

## 🎛️ Control System

### Main Integration Toggle
**Enable Daily Notes Integration**: Master switch that enables/disables entire integration system

### Granular Controls
Each aspect of Daily Notes can be controlled independently:

#### 📁 Control Folder Location
- **What it does**: Updates Daily Notes folder to use our monthly structure
- **Example**: Changes folder from `Daily Notes` to `Link/journal/2025/07-July`
- **Benefit**: Daily notes automatically appear in organized monthly folders

#### 📅 Control Date Format  
- **What it does**: Updates Daily Notes date format to match our journal format
- **Example**: Changes format from `YYYY-MM-DD` to `YYYY-MM-DD dddd`
- **Benefit**: Consistent naming across all daily notes

#### 📝 Control Template
- **What it does**: Updates Daily Notes template to use our template file
- **Example**: Sets template to `Link/templates/Daily Notes Template.md`
- **Benefit**: All daily notes use consistent template with Templater integration

### Quick Controls
- **Enable All Controls**: Enables folder, format, and template control with one click
- **Disable All Controls**: Disables all controls while keeping integration enabled

## 🔄 Usage Workflow

### Initial Setup
1. **Enable Integration**: Toggle "Enable Daily Notes Integration"
2. **Choose Controls**: Select which aspects you want the plugin to manage
3. **Apply Settings**: Click "Apply Now" to create backup and apply integration
4. **Confirmation**: Plugin shows success message confirming backup creation

### Ongoing Use
- Plugin automatically updates Daily Notes settings when month changes
- Only enabled controls are updated - disabled controls remain untouched
- Integration works with both Core and Community Daily Notes plugins
- Monthly folder changes automatically update Daily Notes folder path

### Restoration (If Needed)
1. **Access Danger Zone**: Scroll to bottom of integration settings
2. **Review Warning**: Read the warning about permanent changes
3. **Confirm Restore**: Click "Restore & Disable" and confirm in dialog
4. **Complete Reset**: All original settings restored, integration disabled, backup deleted

## 🔧 Technical Details

### Plugin Detection
The plugin automatically detects which Daily Notes plugin you're using:
- **Core Plugin**: `app.internalPlugins.plugins['daily-notes']`
- **Community Plugin**: `app.plugins.plugins['daily-notes']`

### Settings Management
- **Core Plugin**: Updates `instance.options` object
- **Community Plugin**: Updates `settings` object and calls `saveSettings()`
- **Backup Format**: Complete deep copy of original settings object

### Monthly Updates
When month changes (detected hourly):
1. Plugin calculates new monthly folder path
2. Updates Daily Notes folder setting (if folder control enabled)
3. Maintains format and template settings as configured
4. Shows notification of successful update

## 🛡️ Safety Features

### Multiple Confirmation Points
1. **Enable Toggle**: Must explicitly enable integration
2. **Control Selection**: Must choose which settings to control
3. **Apply Button**: Must click "Apply Now" to activate
4. **Restore Confirmation**: Multi-step confirmation for restoration

### Danger Zone Design
- **Visual Separation**: Clear red border and warning styling
- **Warning Text**: Explicit explanation of consequences
- **Confirmation Dialog**: Additional confirmation before restoration
- **Irreversible Warning**: Clear statement that action cannot be undone

### Error Handling
- **Graceful Failures**: If Daily Notes plugin not found, integration skips silently
- **Logging**: All operations logged to console for debugging
- **User Feedback**: Success/error messages shown to user
- **Fallback Behavior**: Plugin continues to work even if integration fails

## 🎯 Best Practices

### Recommended Usage
1. **Start Small**: Enable one control at a time to test behavior
2. **Test First**: Try integration with a test vault before main vault
3. **Backup Vault**: Always have vault backups independent of plugin
4. **Monitor Changes**: Watch for proper folder creation after enabling

### Compatibility
- **Works With**: Core Daily Notes, Community Daily Notes, Templater
- **No Conflicts**: Plugin detects and works alongside existing functionality
- **Templater Integration**: Template includes proper Templater syntax
- **Cross-Platform**: Works on Windows, Mac, Linux

### Troubleshooting
- **No Daily Notes Plugin**: Integration section won't appear if no Daily Notes plugin detected
- **Settings Not Applying**: Check that Daily Notes plugin is enabled and functioning
- **Wrong Folders**: Verify that integration controls are enabled and applied
- **Restore Issues**: Check console for error messages, contact support if needed

## 📋 Settings Reference

### Integration Status Indicators
- **✅ Integration Enabled**: Green checkmark when integration is active
- **📦 Backup Information**: Shows backup creation date and plugin type
- **⚠️ Danger Zone**: Red warning section for restoration

### Control States
- **Enabled + Applied**: Control is active and managing Daily Notes setting
- **Enabled + Not Applied**: Control selected but "Apply Now" not clicked
- **Disabled**: Control not managing corresponding Daily Notes setting

### Backup Information Display
```
📦 Backup Information
Backup created: 12/07/2025, 14:32:15 (core plugin)
```

## 🔍 Advanced Configuration

### Custom Template Integration
If you have existing Daily Notes template:
1. **Before Integration**: Copy your template content
2. **Enable Template Control**: Let plugin manage template setting
3. **Customize Template**: Edit `Link/templates/Daily Notes Template.md`
4. **Templater Syntax**: Use Templater syntax for dynamic dates

### Multi-Vault Setups
- Each vault maintains separate backup and integration settings
- Plugin configuration is vault-specific
- Restoration affects only current vault's Daily Notes settings

### Plugin Updates
- Backup survives plugin updates
- Integration settings preserved across updates
- New features automatically available with existing configuration

---

**Remember**: This integration is designed to enhance your workflow, not replace it. You maintain full control over when and how integration is applied, with complete safety through automatic backup and restoration capabilities. 