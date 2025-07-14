/**
 * Algorithms defined by these types:
 *
 * 1. Settings Management:
 *    - LinkPluginSettings defines the structure for all plugin settings, including directory, journal, daily notes integration, and debug options.
 *    - DailyNotesBackup provides a schema for backing up and restoring Daily Notes plugin settings.
 *
 * 2. Directory and Journal Structure:
 *    - DirectoryTemplate enables recursive directory structure definitions for dynamic folder creation.
 *    - JournalEntry represents a single journal file, including navigation to previous/next entries.
 *
 * 3. Error Handling:
 *    - ErrorLog standardizes error reporting with context and stack trace.
 */

export interface LinkPluginSettings {
  // Plugin enable/disable setting
  enabled: boolean

  // Directory structure settings
  baseFolder: string // Root folder for all plugin-created directories
  directoryStructure: string[]
  restrictedDirectories: string[]
  documentDirectory: string
  journalRootFolder: string

  // Journal settings - SIMPLIFIED
  journalDateFormat: string
  journalFolderFormat: string
  journalYearFormat: string
  journalMonthFormat: string
  simpleJournalMode: boolean // Single setting: true = simple, false = dynamic

  // Daily Notes Integration Settings
  dailyNotesIntegration: {
    enabled: boolean
    backup: DailyNotesBackup | null
  }

  // UI Settings
  showRibbonButton: boolean

  // Other settings
  debugMode: boolean

  // Custom template location (optional)
  customTemplateLocation?: string
}

export interface DailyNotesBackup {
  timestamp: string
  pluginType: 'core' | 'community'
  originalSettings: {
    folder?: string
    format?: string
    template?: string
    [key: string]: any
  }
}

export interface DirectoryTemplate {
  [key: string]: DirectoryTemplate | null
}

export interface JournalEntry {
  date: string
  path: string
  title: string
  previous?: string
  next?: string
}

export interface ErrorLog {
  timestamp: string
  context: string
  message: string
  stack?: string
}
