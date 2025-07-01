export interface LinkPluginSettings {
  // Directory structure settings
  baseFolder: string; // Root folder for all plugin-created directories
  directoryStructure: string[];
  restrictedDirectories: string[];
  documentDirectory: string;
  journalRootFolder: string;

  // Journal settings
  journalDateFormat: string;
  journalFolderFormat: string;
  journalTemplate: string;
  enableDynamicFolders: boolean;
  simpleJournalMode: boolean;

  // Note creation settings
  noteTemplate: string;
  openNewNote: boolean;

  // Shortcode settings (deprecated - moved to quarantine)
  // shortcodeEnabled: boolean;
  // shortcodeTriggerKey: string;
  // customShortcodes: Record<string, string>;

  // File sorting settings
  fileSorting: {
    enableAutoSorting: boolean;
    sortOnFileCreate: boolean;
    sortOnFileModify: boolean;
  };

  // Other settings
  debugMode: boolean;
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