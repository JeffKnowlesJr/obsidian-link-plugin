// Default base folder to prevent collision with existing vault structure
export const DEFAULT_BASE_FOLDER = 'Link';

// Core directory structure - journal, templates, and reference
export const DEFAULT_DIRECTORIES = [
  'journal',
  'templates', 
  'reference'
];

// Template settings - sibling to journal structure for proper organization
export const DEFAULT_TEMPLATES_PATH = 'templates';
export const DAILY_NOTES_TEMPLATE_NAME = 'Daily Notes Template.md';

// Detailed journal structure with new format matching user preferences
export const DEFAULT_JOURNAL_STRUCTURE = {
  'journal': {
    'Misc': null,
    '2025': {
      '01January': null,
      '02February': null,
      '03March': null,
      '04April': null,
      '05May': null,
      '06June': null,
      '07July': null,
      '08August': null,
      '09September': null,
      '10October': null,
      '11November': null,
      '12December': null,
      'Misc': null,
      'Yearly List': null,
      'Yearly Log': null
    },
    'z_Archives': {
      '2022': null,
      '2023': null,
      '2024': null
    }
  }
};

// Reference structure - files folder moved out as separate directory
export const DEFAULT_REFERENCE_STRUCTURE = {
  'reference': null, // For reference notes and documents only
};

// Files structure - now separate from references
export const DEFAULT_FILES_STRUCTURE = {
  'files': {
    'images': null,
    'videos': null,
    'pdfs': null,
    'audio': null,
    'docs': null,
    'other': null
  }
};

// Optional complex structure mentioned in README
export const OPTIONAL_DIRECTORIES = [
  'context',
  'schema',
  'Projects'
];

export const COMMAND_IDS = {
  CREATE_LINKED_NOTE: 'create-linked-note',
  REBUILD_DIRECTORY: 'rebuild-directory-structure',
  OPEN_TODAY_JOURNAL: 'open-today-journal',
  CREATE_TODAY_NOTE: 'create-today-note',
  CREATE_FUTURE_NOTE: 'create-future-note',
  CREATE_MONTHLY_FOLDERS: 'create-monthly-folders',
  EXPAND_SHORTCODE: 'expand-shortcode',
  SHOW_LINK_SUGGESTIONS: 'show-link-suggestions'
} as const;

// Ribbon button configurations
export const RIBBON_BUTTONS = {
  TODAY_JOURNAL: {
    icon: 'calendar-days',
    title: 'Open Today\'s Journal',
    tooltip: 'Open or create today\'s journal entry'
  },
  CREATE_NOTE: {
    icon: 'file-plus',
    title: 'Create Linked Note',
    tooltip: 'Create a new linked note from selected text'
  },
  MONTHLY_FOLDERS: {
    icon: 'folder-plus',
    title: 'Create Monthly Folders',
    tooltip: 'Create monthly folders for the current year'
  },
  // SHORTCODE_HELP: {
  //   icon: 'zap',
  //   title: 'Shortcode Help',
  //   tooltip: 'Show available shortcodes and examples'
  // }, // Deprecated - moved to quarantine
  REBUILD_STRUCTURE: {
    icon: 'folder-sync',
    title: 'Rebuild Directory Structure',
    tooltip: 'Rebuild the plugin\'s directory structure'
  },
  PLUGIN_SETTINGS: {
    icon: 'settings',
    title: 'Link Plugin Settings',
    tooltip: 'Open Link Plugin settings'
  }
} as const;

export const DATE_FORMATS = {
  DEFAULT_JOURNAL: 'YYYY-MM-DD dddd',
  ISO_DATE: 'YYYY-MM-DD',
  FOLDER_FORMAT: 'YYYY/MM'
} as const;

// Deprecated - moved to quarantine
// export const SHORTCODE_PATTERNS = {
//   ELEMENT: /^[a-zA-Z0-9_-]+$/,
//   MULTIPLIER: /^[a-zA-Z0-9_-]+\*\d+$/,
//   CHILD: />/,
//   SIBLING: /\+/,
//   CONTENT: /\{.*\}/,
//   ATTRIBUTE: /\[.*\]/,
//   GROUP: /\(.*\)/
// } as const;

export const ERROR_MESSAGES = {
  INVALID_PATH: 'Invalid file path provided',
  DIRECTORY_CREATE_FAILED: 'Failed to create directory',
  FILE_CREATE_FAILED: 'Failed to create file',
  SHORTCODE_PARSE_ERROR: 'Failed to parse shortcode',
  JOURNAL_CREATE_ERROR: 'Failed to create journal entry'
} as const;

export const DEFAULT_TEMPLATES = {
  JOURNAL: `# {{date}}

## Daily Log

## Tasks
- [ ] 

## Notes

## Reflection

---
Previous: {{previous}}
Next: {{next}}
`,
  NOTE: `---
title: {{title}}
created: {{date}}
source: {{source}}
tags: []
---

# {{title}}

`
} as const;

export const REGEX_PATTERNS = {
  WIKI_LINK: /\[\[(.*?)\]\]/g,
  SHORTCODE: /[\w>+*{}\[\]()]+$/,
  DATE_FILENAME: /\d{4}-\d{2}-\d{2}/,
  INVALID_FILENAME_CHARS: /[\\/:*?"<>|]/g
} as const;