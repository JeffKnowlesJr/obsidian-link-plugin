export interface LinkPluginSettings {
  // Directory structure settings
  baseFolder: string; // Root folder for all plugin-created directories
  directoryStructure: string[];
  restrictedDirectories: string[];
  documentDirectory: string;
  journalRootFolder: string;

  // Journal settings - SIMPLIFIED
  journalDateFormat: string;
  journalFolderFormat: string;
  journalYearFormat: string;
  journalMonthFormat: string;
  journalTemplate: string;
  simpleJournalMode: boolean; // Single setting: true = simple, false = dynamic

  // Note creation settings
  noteTemplate: string;

  // Daily Notes Integration Settings
  dailyNotesIntegration: {
    enabled: boolean;
    controls: {
      folder: boolean;
      format: boolean;
      template: boolean;
    };
    backup: DailyNotesBackup | null;
  };

  // File sorting settings - QUARANTINED (kept for compatibility)
  fileSorting: {
    enableAutoSorting: boolean;
    sortOnFileCreate: boolean;
    sortOnFileModify: boolean;
  };

  // Other settings
  debugMode: boolean;
}

export interface DailyNotesBackup {
  timestamp: string;
  pluginType: 'core' | 'community';
  originalSettings: {
    folder?: string;
    format?: string;
    template?: string;
    [key: string]: any;
  };
}

// Shortcode types (deprecated - moved to quarantine)
// export interface Token {
//   type: 'element' | 'multiplier' | 'content' | 'attribute' | 'operator' | 'group';
//   value: string;
//   children?: Token[];
// }

// export interface ASTNode {
//   type: string;
//   name?: string;
//   content?: string;
//   attributes?: Record<string, string>;
//   repeat?: number;
//   children?: ASTNode[];
//   parent?: string;
// }

export interface DirectoryTemplate {
  [key: string]: DirectoryTemplate | null;
}

export interface JournalEntry {
  date: string;
  path: string;
  title: string;
  previous?: string;
  next?: string;
}

export interface LinkSuggestion {
  title: string;
  path: string;
  relevance: number;
  type: 'existing' | 'new';
}

// export interface ShortcodeDefinition {
//   pattern: string;
//   expansion: string;
//   description: string;
//   category: string;
// }

export interface ErrorLog {
  timestamp: string;
  context: string;
  message: string;
  stack?: string;
}