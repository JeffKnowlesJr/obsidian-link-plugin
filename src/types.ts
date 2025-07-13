export interface LinkPluginSettings {
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
  journalTemplate: string
  simpleJournalMode: boolean // Single setting: true = simple, false = dynamic



  // Daily Notes Integration Settings
  dailyNotesIntegration: {
    enabled: boolean
    backup: DailyNotesBackup | null
  }



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
