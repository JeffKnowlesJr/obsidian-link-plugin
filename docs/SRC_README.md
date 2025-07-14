# Obsidian Link Plugin

A focused daily note organization system for Obsidian that provides intelligent monthly folder management and seamless Daily Notes integration.

## Overview

The Obsidian Link Plugin is designed to simplify journal management in Obsidian by automatically creating monthly folder structures and integrating with the Daily Notes plugin. It provides a clean, modular architecture that separates concerns and provides robust error handling.

## Features

### Core Functionality
- **Automatic Monthly Folders**: Creates year/month folder structures automatically
- **Daily Notes Integration**: Seamlessly integrates with Obsidian's Daily Notes plugin
- **Date Change Monitoring**: Automatically detects month changes and creates new folders
- **Journal Entry Management**: Easy creation and navigation of journal entries
- **Template Support**: Customizable journal templates with placeholders

### User Interface
- **Ribbon Buttons**: Quick access to common journal functions
- **Settings Panel**: Comprehensive configuration options
- **Commands**: Keyboard shortcuts for journal management
- **Date Picker**: User-friendly date selection for future notes

### Advanced Features
- **Error Resilience**: Plugin continues to function even when errors occur
- **Settings Validation**: Comprehensive settings validation and backup
- **Debug Mode**: Detailed logging for troubleshooting
- **Cross-Platform**: Works on Windows, macOS, and Linux

## Architecture

The plugin follows a modular architecture with clear separation of concerns:

### Core Components

1. **Main Plugin Class** (`main.ts`) - Orchestrates the entire application
2. **Managers** - Handle specific domains (Directory, Journal)
3. **Services** - Provide shared functionality (DateService)
4. **UI Components** - Settings and ribbon management
5. **Utilities** - Helper functions and error handling
6. **Settings System** - Modular configuration management

### Key Algorithms

#### Initialization Sequence
The plugin follows a strict initialization order to ensure dependencies are properly set up:

```typescript
async onload() {
  // 1. Initialize DateService first (required by other components)
  DateService.initialize()
  
  // 2. Load and validate settings (required by managers)
  await this.loadSettings()
  
  // 3. Initialize error handler (used by all components)
  this.errorHandler = new ErrorHandler(this)
  
  // 4. Initialize managers (depend on settings and error handler)
  this.directoryManager = new DirectoryManager(this)
  this.journalManager = new JournalManager(this)
  this.ribbonManager = new RibbonManager(this)
  
  // 5. Setup UI components
  this.addSettingTab(new SettingsTab(this.app, this))
  this.ribbonManager.initializeRibbon()
  
  // 6. Register commands and event handlers
  this.registerCommands()
  this.registerEventHandlers()
  
  // 7. Initialize directory structure
  await this.directoryManager.rebuildDirectoryStructure()
  
  // 8. Ensure current month folder exists
  await this.journalManager.checkAndCreateCurrentMonthFolder()
  
  // 9. Update Daily Notes integration
  await this.updateDailyNotesSettings()
  
  // 10. Start date change monitoring
  this.startDateChangeMonitoring()
}
```

#### Settings Management
The plugin uses a two-phase settings system:

```typescript
// Load phase: Validate and merge with defaults
async loadSettings() {
  const loadedData = await this.loadData()
  this.settings = validateSettings(loadedData || {})
}

// Save phase: Persist and update UI
async saveSettings() {
  await this.saveData(this.settings)
  if (this.ribbonManager) {
    this.ribbonManager.updateButtonStates()
  }
}
```

#### Command Registration
Each command is wrapped with error handling and encapsulates a specific journal management action:

```typescript
registerCommands() {
  // Rebuild directory structure command
  this.addCommand({
    id: COMMAND_IDS.REBUILD_DIRECTORY,
    name: 'Rebuild Directory Structure',
    callback: () => {
      try {
        this.directoryManager.rebuildDirectoryStructure()
      } catch (error) {
        this.errorHandler.handleError(error, 'Failed to rebuild directory structure')
      }
    }
  })
  
  // Additional commands for note creation and folder management
}
```

#### Date Change Monitoring
Automatically detects month changes and creates new monthly folders:

```typescript
private startDateChangeMonitoring(): void {
  let lastCheckedMonth = DateService.format(DateService.now(), 'YYYY-MM')
  
  // Check every hour for date changes
  this.registerInterval(
    window.setInterval(async () => {
      const currentMonth = DateService.format(DateService.now(), 'YYYY-MM')
      
      // If month changed, create new monthly folder and update settings
      if (currentMonth !== lastCheckedMonth) {
        await this.journalManager.checkAndCreateCurrentMonthFolder()
        await this.updateDailyNotesSettings()
        lastCheckedMonth = currentMonth
      }
    }, 60 * 60 * 1000) // Check every hour
  )
}
```

#### Daily Notes Integration
Seamlessly integrates with Obsidian's Daily Notes plugin:

```typescript
async updateDailyNotesSettings(): Promise<void> {
  // Skip if integration is disabled
  if (!this.settings.dailyNotesIntegration.enabled) {
    return
  }
  
  try {
    // Try core plugin first
    const dailyNotesPlugin = this.app.internalPlugins?.plugins?.['daily-notes']
    if (dailyNotesPlugin && dailyNotesPlugin.enabled) {
      await this.updateCorePluginSettings(dailyNotesPlugin)
    } else {
      // Fallback to community plugin
      const communityDailyNotes = this.app.plugins?.plugins?.['daily-notes']
      if (communityDailyNotes) {
        await this.updateCommunityPluginSettings(communityDailyNotes)
      }
    }
  } catch (error) {
    console.log('Daily Notes integration skipped:', error)
  }
}
```

## Directory Structure

The plugin creates an organized folder structure for journal management:

```
Link/
├── journal/
│   ├── 2025/
│   │   ├── 01January/
│   │   ├── 02February/
│   │   └── ...
│   ├── Misc/
│   ├── Yearly List/
│   ├── Yearly Log/
│   └── z_Archives/
│       ├── 2022/
│       ├── 2023/
│       └── 2024/
└── templates/
    └── Daily Notes Template.md
```

## Settings

### Core Settings
- **Base Folder**: Root folder for all plugin-created directories
- **Directory Structure**: Array of core directories to create
- **Journal Root Folder**: Main journal folder name
- **Simple Journal Mode**: Toggle between simple and dynamic folder structures

### Journal Settings
- **Journal Date Format**: Format for journal entry filenames
- **Journal Folder Format**: Format for folder names
- **Journal Year Format**: Format for year folders
- **Journal Month Format**: Format for month folders
- **Journal Template**: Template content for new journal entries

### Daily Notes Integration
- **Enabled**: Toggle Daily Notes integration
- **Backup**: Automatic backup of original Daily Notes settings
- **Restore**: Restore original settings if needed

### Advanced Settings
- **Debug Mode**: Enable detailed logging
- **Custom Template Location**: Override default template location
- **Restricted Directories**: Directories to avoid when creating structure

## Commands

The plugin provides several commands for journal management:

- **Rebuild Directory Structure**: Recreates the plugin's directory structure
- **Open Today's Journal**: Opens or creates today's journal entry
- **Create Today's Daily Note**: Creates today's note using Daily Notes integration
- **Create Future Daily Note**: Creates a note for a specific future date
- **Create Monthly Folders**: Creates monthly folders for the current year

## Usage

### Basic Usage
1. Install the plugin in Obsidian
2. Configure settings in the plugin settings panel
3. Use ribbon buttons or commands to manage journal entries
4. The plugin will automatically create monthly folders as needed

### Daily Notes Integration
1. Enable Daily Notes integration in settings
2. The plugin will automatically configure Daily Notes settings
3. Use Daily Notes commands to create journal entries
4. Settings are automatically synchronized

### Advanced Usage
1. Customize journal templates with placeholders
2. Configure custom folder structures
3. Use debug mode for troubleshooting
4. Restore original Daily Notes settings if needed

## Error Handling

The plugin includes comprehensive error handling:

1. **Error Logging**: All errors are logged with context
2. **User-Friendly Messages**: Clear error messages for users
3. **Graceful Degradation**: Plugin continues to function even when errors occur
4. **Debug Mode**: Detailed logging for troubleshooting

## Design Principles

1. **Separation of Concerns**: Each component has a single responsibility
2. **Error Resilience**: Plugin continues to function even when errors occur
3. **User-Friendly**: Clear error messages and intuitive UI
4. **Extensible**: Modular design allows for easy feature additions
5. **Performance**: Efficient algorithms and minimal resource usage
6. **Integration**: Works seamlessly with Obsidian's ecosystem

## Development

### Project Structure
```
src/
├── main.ts                 # Main plugin class
├── types.ts               # Type definitions
├── constants.ts           # Constants and configuration
├── settings.ts            # Settings management
├── managers/              # Domain-specific managers
│   ├── directoryManager.ts
│   └── journalManager.ts
├── services/              # Shared services
│   └── dateService.ts
├── utils/                 # Utility functions
│   ├── errorHandler.ts
│   ├── pathUtils.ts
│   └── dateUtils.ts
├── ui/                    # User interface components
│   ├── ribbonManager.ts
│   └── settingsTab.ts
└── settings/              # Modular settings
    ├── index.ts
    ├── defaultSettings.ts
    ├── settingsValidator.ts
    ├── directorySettings.ts
    ├── journalSettings.ts
    ├── generalSettings.ts
    └── dailyNotesSettings.ts
```

### Key Algorithms

#### Directory Structure Creation
```typescript
async rebuildDirectoryStructure(): Promise<void> {
  // 1. Create base folder if specified
  const basePath = baseFolder ? normalizePath(baseFolder) : ''
  if (basePath) {
    await this.getOrCreateDirectory(basePath)
  }
  
  // 2. Create configured directories
  for (const dirName of directoryStructure || ['journal']) {
    const dirPath = basePath ? PathUtils.joinPath(basePath, dirName) : dirName
    await this.getOrCreateDirectory(dirPath)
  }
  
  // 3. Create journal structure
  await this.createJournalStructure(basePath)
}
```

#### Journal Entry Creation
```typescript
async createOrOpenJournalEntry(date: any): Promise<TFile> {
  // 1. Create monthly folder structure
  await this.ensureMonthlyFolderExists(date)
  
  // 2. Generate file path
  const monthlyFolderPath = this.getMonthlyFolderPath(date)
  const fileName = DateService.getJournalFilename(date, journalDateFormat)
  const filePath = normalizePath(`${monthlyFolderPath}/${fileName}.md`)
  
  // 3. Create file if it doesn't exist
  let file = vault.getAbstractFileByPath(filePath) as TFile
  if (!file) {
    file = await vault.create(filePath, '')
  }
  
  return file
}
```

#### Monthly Folder Management
```typescript
async ensureMonthlyFolderExists(date: any): Promise<void> {
  const monthlyFolderPath = this.getMonthlyFolderPath(date)
  const folderExists = await this.plugin.app.vault.adapter.exists(monthlyFolderPath)
  
  if (!folderExists) {
    await this.plugin.directoryManager.getOrCreateDirectory(monthlyFolderPath)
  }
}

public getMonthlyFolderPath(date: any): string {
  const journalBasePath = this.plugin.directoryManager.getJournalPath()
  
  if (this.plugin.settings.simpleJournalMode) {
    return journalBasePath // Simple: just use journal root folder
  }
  
  // Dynamic: use year/month folder structure
  return DateService.getMonthlyFolderPath(
    journalBasePath, 
    date, 
    this.plugin.settings.journalYearFormat,
    this.plugin.settings.journalMonthFormat
  )
}
```

## Conclusion

The Obsidian Link Plugin is a well-architected application that provides intelligent daily note organization with automatic monthly folder management and seamless Daily Notes integration. The modular design, comprehensive error handling, and user-friendly interface make it a robust solution for journal management in Obsidian.

For detailed component documentation, see `COMPONENT_DOCUMENTATION.md`.
For application architecture documentation, see `APPLICATION_DOCUMENTATION.md`. 